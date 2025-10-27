import Redis from 'ioredis'

// Configure Redis connection via REDIS_URL env var (e.g. redis://localhost:6379)
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')

redis.on('error', (err: Error) => {
  console.error('Redis error', err)
})

export default redis
