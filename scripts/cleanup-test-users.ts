import { prisma } from '../lib/prisma'

async function cleanup() {
  console.log('🧹 Cleaning up test users...')
  
  // Delete users with test emails
  const deleted = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'test@example.com' } },
        { email: { contains: '@battleide.com' } },
        { username: { startsWith: 'testuser' } },
      ],
    },
  })
  
  console.log(`✅ Deleted ${deleted.count} test user(s)`)
}

cleanup()
  .then(() => {
    console.log('✨ Cleanup complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })
