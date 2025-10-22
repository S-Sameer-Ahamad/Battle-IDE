/**
 * Judge0 Battle Execution Service
 * 
 * This module handles code execution for battle submissions.
 * It validates code against problem test cases and determines results.
 */

import { judge0Service, SUPPORTED_LANGUAGES, type ExecutionResult } from './judge0'

export interface TestCase {
  input: string
  expectedOutput: string
}

export interface TestResult {
  testCaseIndex: number
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  executionTime: number
  memory: number
  error?: string
}

export interface BattleExecutionResult {
  success: boolean
  totalTests: number
  passedTests: number
  failedTests: number
  testResults: TestResult[]
  executionTime: number
  memory: number
  error?: string
}

/**
 * Get language ID for Judge0
 */
function getLanguageId(language: string): number {
  const langMap: Record<string, keyof typeof SUPPORTED_LANGUAGES> = {
    'python': 'python',
    'javascript': 'javascript',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'ruby': 'ruby',
    'go': 'go',
  }
  
  const langKey = langMap[language.toLowerCase()]
  if (!langKey) {
    throw new Error(`Unsupported language: ${language}`)
  }
  
  return SUPPORTED_LANGUAGES[langKey]
}

/**
 * Extract output from execution result
 */
function extractOutput(result: ExecutionResult): string {
  if (result.stdout) {
    return result.stdout.trim()
  }
  if (result.stderr) {
    return `Error: ${result.stderr}`
  }
  if (result.compile_output) {
    return `Compile Error: ${result.compile_output}`
  }
  if (result.message) {
    return `Error: ${result.message}`
  }
  return ''
}

/**
 * Check if execution was successful
 */
function isExecutionSuccessful(result: ExecutionResult): boolean {
  // Status ID 3 = Accepted
  return result.status.id === 3
}

/**
 * Execute code against all test cases for a battle
 */
export async function executeBattleSubmission(
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<BattleExecutionResult> {
  const testResults: TestResult[] = []
  let totalExecutionTime = 0
  let maxMemory = 0
  let passedCount = 0
  let failedCount = 0

  console.log(`🎯 Executing battle submission with ${testCases.length} test cases`)
  console.log(`Language: ${language}`)

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n📝 Test Case ${i + 1}/${testCases.length}`)
    console.log(`Input: ${testCase.input}`)
    console.log(`Expected: ${testCase.expectedOutput}`)

    try {
      // Execute code with this test case input
      const result = await judge0Service.executeCode({
        language_id: getLanguageId(language),
        source_code: code,
        stdin: testCase.input,
      })

      const isSuccess = isExecutionSuccessful(result)
      const actualOutput = extractOutput(result)
      const executionTime = parseFloat(result.time) || 0

      if (!isSuccess) {
        // Execution failed
        testResults.push({
          testCaseIndex: i,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          passed: false,
          executionTime,
          memory: result.memory || 0,
          error: result.status.description,
        })
        failedCount++
        console.log(`❌ FAILED: ${result.status.description}`)
        continue
      }

      // Compare output (trim whitespace for comparison)
      const expectedOutput = testCase.expectedOutput.trim()
      const passed = actualOutput === expectedOutput

      testResults.push({
        testCaseIndex: i,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        passed,
        executionTime,
        memory: result.memory || 0,
      })

      if (passed) {
        passedCount++
        console.log(`✅ PASSED`)
      } else {
        failedCount++
        console.log(`❌ FAILED`)
        console.log(`Expected: "${expectedOutput}"`)
        console.log(`Got: "${actualOutput}"`)
      }

      totalExecutionTime += executionTime
      maxMemory = Math.max(maxMemory, result.memory || 0)
    } catch (error) {
      console.error(`❌ Test case ${i + 1} error:`, error)
      testResults.push({
        testCaseIndex: i,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        passed: false,
        executionTime: 0,
        memory: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      failedCount++
    }
  }

  const allPassed = passedCount === testCases.length

  console.log(`\n📊 Execution Summary:`)
  console.log(`Total: ${testCases.length}`)
  console.log(`Passed: ${passedCount} ✅`)
  console.log(`Failed: ${failedCount} ❌`)
  console.log(`Success Rate: ${((passedCount / testCases.length) * 100).toFixed(1)}%`)

  return {
    success: allPassed,
    totalTests: testCases.length,
    passedTests: passedCount,
    failedTests: failedCount,
    testResults,
    executionTime: totalExecutionTime,
    memory: maxMemory,
  }
}

/**
 * Parse test cases from database JSON format
 */
export function parseTestCases(testCasesJson: string | any): TestCase[] {
  const testCases = typeof testCasesJson === 'string' 
    ? JSON.parse(testCasesJson) 
    : testCasesJson

  if (!Array.isArray(testCases)) {
    throw new Error('Test cases must be an array')
  }

  return testCases.map((tc: any, index: number) => {
    if (!tc.input || tc.expectedOutput === undefined) {
      throw new Error(`Test case ${index} is missing input or expectedOutput`)
    }
    return {
      input: String(tc.input),
      expectedOutput: String(tc.expectedOutput),
    }
  })
}

/**
 * Format execution result for display
 */
export function formatExecutionResult(result: BattleExecutionResult): string {
  const { passedTests, totalTests, testResults } = result
  
  let output = `\n🎯 Test Results: ${passedTests}/${totalTests} passed\n\n`
  
  testResults.forEach((test, index) => {
    const icon = test.passed ? '✅' : '❌'
    output += `${icon} Test ${index + 1}: ${test.passed ? 'PASSED' : 'FAILED'}\n`
    
    if (!test.passed) {
      output += `   Input: ${test.input}\n`
      output += `   Expected: ${test.expectedOutput}\n`
      output += `   Got: ${test.actualOutput}\n`
      if (test.error) {
        output += `   Error: ${test.error}\n`
      }
    }
    
    output += `   Time: ${test.executionTime}ms | Memory: ${test.memory}KB\n\n`
  })
  
  return output
}
