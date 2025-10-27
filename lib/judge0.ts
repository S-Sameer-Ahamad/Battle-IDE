import { z } from 'zod';
import './env'; // Load environment variables

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
// Support multiple RapidAPI keys (comma-separated) for fallback/rotation
const RAPIDAPI_KEYS: string[] = (
  process.env.JUDGE0_API_KEYS || process.env.JUDGE0_API_KEY || ''
)
  .split(',')
  .map(k => k.trim())
  .filter(Boolean)
let rapidApiKeyIndex = 0
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
const USE_RAPIDAPI = /rapidapi\.com/i.test(JUDGE0_API_URL);

// Language IDs supported by Judge0 CE
export const SUPPORTED_LANGUAGES = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  java: 62,        // Java
  cpp: 54,         // C++
  c: 50,          // C
  ruby: 72,       // Ruby
  go: 60,         // Go
} as const;

export const submissionSchema = z.object({
  source_code: z.string(),
  language_id: z.number(),
  stdin: z.string().optional(),
  expected_output: z.string().optional(),
  cpu_time_limit: z.number().optional(),
  memory_limit: z.number().optional(),
});

export type SubmissionRequest = z.infer<typeof submissionSchema>;

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
}

export class Judge0Service {
  private static instance: Judge0Service;
  
  private constructor() {
    // Validate configuration on initialization
    if (!JUDGE0_API_URL) {
      throw new Error('JUDGE0_API_URL is not configured');
    }
    // API key and host are only required when using RapidAPI endpoints
    if (USE_RAPIDAPI) {
      if (!RAPIDAPI_KEYS.length) {
        throw new Error('JUDGE0_API_KEYS/JUDGE0_API_KEY is not configured for RapidAPI');
      }
      if (!JUDGE0_HOST) {
        throw new Error('JUDGE0_HOST is not configured for RapidAPI');
      }
    }
  }

  static getInstance(): Judge0Service {
    if (!Judge0Service.instance) {
      Judge0Service.instance = new Judge0Service();
    }
    return Judge0Service.instance;
  }

  // Method to validate configuration
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!JUDGE0_API_URL) {
      errors.push('JUDGE0_API_URL is not configured');
    }
    if (USE_RAPIDAPI) {
      if (!RAPIDAPI_KEYS.length) {
        errors.push('JUDGE0_API_KEYS/JUDGE0_API_KEY is not configured for RapidAPI');
      }
      if (!JUDGE0_HOST) {
        errors.push('JUDGE0_HOST is not configured for RapidAPI');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async createSubmission(submission: SubmissionRequest): Promise<string> {

    // Encode submission data in base64
    const base64Submission = {
      ...submission,
      source_code: Buffer.from(submission.source_code).toString('base64'),
      stdin: submission.stdin ? Buffer.from(submission.stdin).toString('base64') : undefined,
      expected_output: submission.expected_output ? Buffer.from(submission.expected_output).toString('base64') : undefined,
    };

    // Simple fetch with timeout
    const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(url, { ...options, signal: controller.signal });
        return resp;
      } finally {
        clearTimeout(id);
      }
    }

    // Retry helper
    const requestWithRetry = async (attempts = 3, delayMs = 750): Promise<Response> => {
      let lastErr: any
      for (let i = 0; i < attempts; i++) {
        // For each attempt, try all available RapidAPI keys (round-robin) before backing off
        const keysToTry = USE_RAPIDAPI ? (RAPIDAPI_KEYS.length ? RAPIDAPI_KEYS.length : 1) : 1
        for (let k = 0; k < keysToTry; k++) {
          try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (USE_RAPIDAPI) {
              headers['X-RapidAPI-Host'] = JUDGE0_HOST
              const key = RAPIDAPI_KEYS[rapidApiKeyIndex % RAPIDAPI_KEYS.length]
              if (!key) throw new Error('Missing RapidAPI key')
              headers['X-RapidAPI-Key'] = key
            }
            const resp = await fetchWithTimeout(`${JUDGE0_API_URL}/submissions?base64_encoded=true`, {
              method: 'POST',
              headers,
              body: JSON.stringify(base64Submission),
            })
            // If we get rate-limited or unauthorized, rotate key and try next
            if (USE_RAPIDAPI && (resp.status === 429 || resp.status === 401 || resp.status === 403)) {
              rapidApiKeyIndex = (rapidApiKeyIndex + 1) % Math.max(1, RAPIDAPI_KEYS.length)
              lastErr = new Error(`RapidAPI key rejected with status ${resp.status}`)
              continue
            }
            return resp
          } catch (e) {
            lastErr = e
            // Rotate to next key on network error as well
            if (USE_RAPIDAPI && RAPIDAPI_KEYS.length > 1) {
              rapidApiKeyIndex = (rapidApiKeyIndex + 1) % RAPIDAPI_KEYS.length
            }
          }
        }
        if (i < attempts - 1) {
          await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)))
          continue
        }
        throw lastErr
      }
      // Should never reach
      throw lastErr || new Error('Unknown error')
    }

    try {
      const response = await requestWithRetry(3, 750)

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Judge0 submission failed:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`Failed to create submission: ${response.status} ${response.statusText}`);
      }

      try {
        const data = JSON.parse(responseText);
        if (!data.token) {
          throw new Error('No token received in response');
        }
        return data.token;
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Judge0 API Error: ${error.message}`);
      }
      throw error;
    }
  }

  private async getSubmission(token: string): Promise<ExecutionResult> {
    const headers: Record<string, string> = {}
    if (USE_RAPIDAPI) {
      headers['X-RapidAPI-Host'] = JUDGE0_HOST
      const key = RAPIDAPI_KEYS[rapidApiKeyIndex % Math.max(1, RAPIDAPI_KEYS.length)]
      if (!key) throw new Error('Missing RapidAPI key')
      headers['X-RapidAPI-Key'] = key
    }

    const response = await fetch(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=*`, {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get submission result');
    }

    const result = await response.json();
    
    // Decode base64 fields if they exist
    return {
      ...result,
      stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
      stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
      compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : null,
      message: result.message ? Buffer.from(result.message, 'base64').toString() : null,
    };
  }

  async executeCode(submission: SubmissionRequest): Promise<ExecutionResult> {
    try {
      // Create submission and get token
      const token = await this.createSubmission(submission);

      // Poll for result (max 10 attempts, 1 second apart)
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result = await this.getSubmission(token);
        
        // Check if processing is complete (status IDs 1 and 2 are "In Queue" and "Processing")
        if (result.status.id > 2) {
          return result;
        }
        
        attempts++;
      }
      
      throw new Error('Execution timed out - submission is still processing');
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }

  async validateTestCases(
    code: string,
    languageId: number,
    testCases: { input: string; expectedOutput: string }[]
  ): Promise<{ passed: boolean; results: ExecutionResult[]; passedCount: number; totalCount: number }> {
    const results: ExecutionResult[] = [];
    let passedCount = 0;

    for (const testCase of testCases) {
      try {
        const result = await this.executeCode({
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput,
          cpu_time_limit: 5, // 5 seconds
          memory_limit: 128000, // 128MB
        });

        results.push(result);

        // Check if the test case passed (status 3 is "Accepted")
        if (result.status.id === 3) {
          passedCount++;
        }
      } catch (error) {
        console.error('Error executing test case:', error);
        // Create a failed result for this test case
        results.push({
          stdout: null,
          stderr: error instanceof Error ? error.message : 'Unknown error',
          compile_output: null,
          message: 'Execution failed',
          time: '0',
          memory: 0,
          status: {
            id: 13, // Internal Error
            description: 'Internal Error',
          },
        });
      }
    }

    return {
      passed: passedCount === testCases.length,
      results,
      passedCount,
      totalCount: testCases.length,
    };
  }
}

// Export singleton instance
export const judge0Service = Judge0Service.getInstance();
