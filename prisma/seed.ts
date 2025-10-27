import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample problems
  const problems = await Promise.all([
    prisma.problem.create({
      data: {
        title: "Two Sum",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        examples: `**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
  difficulty: "Easy",
  timeLimit: 600000, // 10 minutes in ms
        memoryLimit: 256,
        testCases: JSON.stringify([
          { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
          { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
          { input: "[3,3]\n6", expectedOutput: "[0,1]" },
          { input: "[1,2,3,4,5]\n8", expectedOutput: "[2,4]" },
          { input: "[0,1,2,3,4]\n5", expectedOutput: "[1,4]" }
        ]),
        solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
      }
    }),
    prisma.problem.create({
      data: {
        title: "Add Two Numbers",
        description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
        examples: `**Example 1:**
\`\`\`
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
\`\`\`

**Example 2:**
\`\`\`
Input: l1 = [0], l2 = [0]
Output: [0]
\`\`\`

**Example 3:**
\`\`\`
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
\`\`\``,
  difficulty: "Medium",
  timeLimit: 1200000, // 20 minutes in ms
        memoryLimit: 256,
        testCases: JSON.stringify([
          { input: "[2,4,3]\n[5,6,4]", expectedOutput: "[7,0,8]" },
          { input: "[0]\n[0]", expectedOutput: "[0]" },
          { input: "[9,9,9,9,9,9,9]\n[9,9,9,9]", expectedOutput: "[8,9,9,9,0,0,0,1]" }
        ]),
        solution: `function addTwoNumbers(l1, l2) {
  let dummy = new ListNode(0);
  let current = dummy;
  let carry = 0;
  
  while (l1 || l2 || carry) {
    let sum = carry;
    if (l1) {
      sum += l1.val;
      l1 = l1.next;
    }
    if (l2) {
      sum += l2.val;
      l2 = l2.next;
    }
    
    carry = Math.floor(sum / 10);
    current.next = new ListNode(sum % 10);
    current = current.next;
  }
  
  return dummy.next;
}`
      }
    }),
    prisma.problem.create({
      data: {
        title: "Longest Substring Without Repeating Characters",
        description: `Given a string s, find the length of the longest substring without repeating characters.`,
        examples: `**Example 1:**
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`

**Example 3:**
\`\`\`
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
\`\`\``,
  difficulty: "Hard",
  timeLimit: 1800000, // 30 minutes in ms
        memoryLimit: 256,
        testCases: JSON.stringify([
          { input: '"abcabcbb"', expectedOutput: "3" },
          { input: '"bbbbb"', expectedOutput: "1" },
          { input: '"pwwkew"', expectedOutput: "3" },
          { input: '""', expectedOutput: "0" },
          { input: '"dvdf"', expectedOutput: "3" }
        ]),
        solution: `function lengthOfLongestSubstring(s) {
  const charSet = new Set();
  let left = 0;
  let maxLength = 0;
  
  for (let right = 0; right < s.length; right++) {
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }
    charSet.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  
  return maxLength;
}`
      }
    })
  ])

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@battleide.com",
        username: "Admin",
        bio: "Battle IDE Administrator",
        elo: 2000,
        wins: 50,
        losses: 10
      }
    }),
    prisma.user.create({
      data: {
        email: "player1@example.com",
        username: "CodeMaster",
        bio: "Competitive programmer",
        elo: 1350,
        wins: 25,
        losses: 15
      }
    }),
    prisma.user.create({
      data: {
        email: "player2@example.com",
        username: "AlgoNinja",
        bio: "Algorithm enthusiast",
        elo: 1280,
        wins: 20,
        losses: 18
      }
    }),
    prisma.user.create({
      data: {
        email: "player3@example.com",
        username: "DataWizard",
        bio: "Data structures expert",
        elo: 1420,
        wins: 30,
        losses: 12
      }
    }),
    prisma.user.create({
      data: {
        email: "player4@example.com",
        username: "BugHunter",
        bio: "Debugging specialist",
        elo: 1150,
        wins: 15,
        losses: 20
      }
    })
  ])

  console.log("Database seeded successfully!")
  console.log(`Created ${problems.length} problems`)
  console.log(`Created ${users.length} users`)

  // Create sample matches for testing
  const match1 = await prisma.match.create({
    data: {
      problemId: problems[0].id,
      type: '1v1',
      status: 'in_progress',
      roomCode: 'TEST01',
      startedAt: new Date(),
      participants: {
        create: [
          {
            userId: users[1].id,
            isHost: true
          },
          {
            userId: users[2].id,
            isHost: false
          }
        ]
      }
    }
  })

  const match2 = await prisma.match.create({
    data: {
      problemId: problems[1].id,
      type: '1v1',
      status: 'waiting',
      roomCode: 'TEST02',
      participants: {
        create: [
          {
            userId: users[3].id,
            isHost: true
          }
        ]
      }
    }
  })

  console.log(`Created 2 sample matches:`)
  console.log(`  - Match 1 (${match1.id}): In Progress - ${users[1].username} vs ${users[2].username}`)
  console.log(`  - Match 2 (${match2.id}): Waiting - ${users[3].username} (looking for opponent)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
