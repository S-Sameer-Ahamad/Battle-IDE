/**
 * Test Judge0 Battle Execution
 * Run this to test the battle submission execution system
 */

import { executeBattleSubmission, parseTestCases } from './lib/judge0-battle'

async function testBattleExecution() {
  console.log('🧪 Testing Judge0 Battle Execution\n')

  // Test case 1: Simple Two Sum problem
  const testCases = [
    {
      input: '[2,7,11,15]\n9',
      expectedOutput: '[0, 1]',
    },
    {
      input: '[3,2,4]\n6',
      expectedOutput: '[1, 2]',
    },
  ]

  // Python solution that should pass
  const pythonCode = `
import sys
lines = sys.stdin.read().strip().split('\\n')
nums = eval(lines[0])
target = int(lines[1])

seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print([seen[complement], i])
        break
    seen[num] = i
`

  console.log('📝 Test Case: Two Sum Problem')
  console.log('Language: Python')
  console.log(`Test Cases: ${testCases.length}\n`)

  try {
    const result = await executeBattleSubmission(pythonCode, 'python', testCases)

    console.log('\n📊 Final Result:')
    console.log(`Success: ${result.success ? '✅' : '❌'}`)
    console.log(`Passed: ${result.passedTests}/${result.totalTests}`)
    console.log(`Execution Time: ${result.executionTime.toFixed(2)}ms`)
    console.log(`Memory: ${result.memory}KB`)

    if (!result.success) {
      console.log('\n❌ Failed Test Details:')
      result.testResults.forEach((test, index) => {
        if (!test.passed) {
          console.log(`\nTest ${index + 1}:`)
          console.log(`  Input: ${test.input}`)
          console.log(`  Expected: ${test.expectedOutput}`)
          console.log(`  Got: ${test.actualOutput}`)
          if (test.error) {
            console.log(`  Error: ${test.error}`)
          }
        }
      })
    }

    process.exit(result.success ? 0 : 1)
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testBattleExecution()
