import { judge0Service, SUPPORTED_LANGUAGES, Judge0Service } from './judge0';

async function testJudge0Integration() {
  try {
    // Check configuration first
    const configCheck = Judge0Service.validateConfig();
    if (!configCheck.isValid) {
      console.error('Configuration errors:', configCheck.errors);
      return false;
    }

    // Test Python code that prints "Hello, World!"
    const testSubmission = {
      source_code: 'print("Hello, World!")',
      language_id: SUPPORTED_LANGUAGES.python,
      stdin: '',
    };

    console.log('Testing Judge0 integration...');
    console.log('Configuration validated successfully');
    console.log('Submitting test code:', testSubmission);

    const result = await judge0Service.executeCode(testSubmission);
    
    console.log('\nExecution Result:');
    console.log('Status:', result.status);
    console.log('Output:', result.stdout);
    console.log('Errors:', result.stderr);
    console.log('Compilation:', result.compile_output);
    console.log('Execution Time:', result.time, 'seconds');
    console.log('Memory Used:', result.memory, 'KB');

    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testJudge0Integration().then(success => {
    if (success) {
      console.log('\nTest completed successfully!');
    } else {
      console.log('\nTest failed!');
      process.exit(1);
    }
  });
}
