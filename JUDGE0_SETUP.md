# Judge0 CE Integration Setup Guide

## Overview
This project uses Judge0 CE API for secure code execution. Judge0 is a robust, scalable, and open-source online code execution system.

## Getting Your API Key

1. Go to [RapidAPI - Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for a free account
3. Subscribe to the Judge0 CE API (Free tier available)
4. Copy your API key from the API dashboard

## Environment Setup

### 1. Create your `.env` file
```bash
cp .env.example .env
```

### 2. Add your Judge0 API key to `.env`
```env
JUDGE0_API_KEY=your-actual-api-key-here
```

### 3. Test the integration
```bash
npx tsx lib/judge0.test.ts
```

You should see:
```
Testing Judge0 integration...
Configuration validated successfully
Submitting test code: { source_code: 'print("Hello, World!")', language_id: 71, stdin: '' }

Execution Result:
Status: { id: 3, description: 'Accepted' }
Output: Hello, World!
...
Test completed successfully!
```

## Supported Languages

The following programming languages are currently supported:

| Language   | Language ID |
|------------|-------------|
| JavaScript | 63          |
| Python     | 71          |
| Java       | 62          |
| C++        | 54          |
| C          | 50          |
| Ruby       | 72          |
| Go         | 60          |

## API Usage

### Basic Code Execution
```typescript
import { judge0Service, SUPPORTED_LANGUAGES } from '@/lib/judge0';

const result = await judge0Service.executeCode({
  source_code: 'print("Hello, World!")',
  language_id: SUPPORTED_LANGUAGES.python,
  stdin: '',
});
```

### Validate Test Cases
```typescript
const testCases = [
  { input: '5\n', expectedOutput: '120' },
  { input: '3\n', expectedOutput: '6' },
];

const { passed, results, passedCount, totalCount } = 
  await judge0Service.validateTestCases(
    code,
    SUPPORTED_LANGUAGES.python,
    testCases
  );
```

## Rate Limits

The free tier of Judge0 CE includes:
- 50 submissions per day
- Maximum execution time: 5 seconds per submission
- Maximum memory: 128 MB per submission

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file or expose your API key in:
- Git repositories
- Client-side code
- Public logs
- Error messages

The `.env` file is already added to `.gitignore` to prevent accidental commits.

## Troubleshooting

### Issue: "JUDGE0_API_KEY is not configured"
**Solution**: Make sure you've created a `.env` file and added your API key.

### Issue: "Failed to create submission"
**Solutions**:
- Check if your API key is valid
- Verify you haven't exceeded rate limits
- Check your internet connection

### Issue: "Execution timed out"
**Solutions**:
- The code might be stuck in an infinite loop
- The submission queue might be busy (try again)
- Increase the polling timeout in `judge0.ts`

## Support

For Judge0 API issues:
- [Judge0 Documentation](https://ce.judge0.com/)
- [RapidAPI Support](https://rapidapi.com/judge0-official/api/judge0-ce/discussions)

For project-specific issues:
- Check the project's GitHub Issues
- Contact the development team
