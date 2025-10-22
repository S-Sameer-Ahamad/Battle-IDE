import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const problems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: JSON.stringify([
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ]),
    timeLimit: 1000,
    memoryLimit: 128,
    testCases: JSON.stringify([
      { input: '[2,7,11,15]\n9', output: '[0,1]' },
      { input: '[3,2,4]\n6', output: '[1,2]' },
      { input: '[3,3]\n6', output: '[0,1]' },
      { input: '[1,5,3,7,9]\n10', output: '[1,3]' },
      { input: '[10,20,30,40]\n70', output: '[2,3]' },
    ]),
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Read input
nums = list(map(int, input().strip()[1:-1].split(',')))
target = int(input().strip())

# Solve and print
result = two_sum(nums, target)
print(result)`,
  },
  {
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

A palindrome number reads the same backward as forward.`,
    examples: JSON.stringify([
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.',
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.',
      },
      {
        input: 'x = 10',
        output: 'false',
      },
    ]),
    timeLimit: 1000,
    memoryLimit: 128,
    testCases: JSON.stringify([
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' },
      { input: '10', output: 'false' },
      { input: '12321', output: 'true' },
      { input: '0', output: 'true' },
    ]),
    solution: `def is_palindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]

x = int(input().strip())
print('true' if is_palindrome(x) else 'false')`,
  },
  {
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: JSON.stringify([
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ]),
    timeLimit: 1000,
    memoryLimit: 128,
    testCases: JSON.stringify([
      { input: 'hello', output: 'olleh' },
      { input: 'Hannah', output: 'hannaH' },
      { input: 'a', output: 'a' },
      { input: 'abc', output: 'cba' },
      { input: 'racecar', output: 'racecar' },
    ]),
    solution: `s = input().strip()
print(s[::-1])`,
  },
  {
    title: 'FizzBuzz',
    difficulty: 'Easy',
    description: `Given an integer n, return a string array answer (1-indexed) where:

- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.`,
    examples: JSON.stringify([
      {
        input: 'n = 3',
        output: '["1","2","Fizz"]',
      },
      {
        input: 'n = 5',
        output: '["1","2","Fizz","4","Buzz"]',
      },
      {
        input: 'n = 15',
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      },
    ]),
    timeLimit: 1000,
    memoryLimit: 128,
    testCases: JSON.stringify([
      { input: '3', output: '["1","2","Fizz"]' },
      { input: '5', output: '["1","2","Fizz","4","Buzz"]' },
      { input: '15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
      { input: '1', output: '["1"]' },
      { input: '10', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz"]' },
    ]),
    solution: `def fizz_buzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

n = int(input().strip())
print(fizz_buzz(n))`,
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: JSON.stringify([
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ]),
    timeLimit: 1000,
    memoryLimit: 128,
    testCases: JSON.stringify([
      { input: '()', output: 'true' },
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' },
      { input: '([)]', output: 'false' },
      { input: '{[]}', output: 'true' },
    ]),
    solution: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    
    return len(stack) == 0

s = input().strip()
print('true' if is_valid(s) else 'false')`,
  },
]

async function seed() {
  console.log('🌱 Seeding problems...')

  try {
    // Clear existing problems
    await prisma.submission.deleteMany({})
    await prisma.matchParticipant.deleteMany({})
    await prisma.match.deleteMany({})
    await prisma.problem.deleteMany({})

    console.log('🗑️  Cleared existing problems and related data')

    // Create problems
    for (const problem of problems) {
      const created = await prisma.problem.create({
        data: problem,
      })
      console.log(`✅ Created: ${created.title} (${created.difficulty})`)
    }

    console.log(`\n🎉 Successfully seeded ${problems.length} problems!`)
  } catch (error) {
    console.error('❌ Error seeding problems:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
