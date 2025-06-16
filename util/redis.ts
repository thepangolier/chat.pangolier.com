import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

/**
 * Re-use the same Redis instance across the
 * entire Next.js process & hot-reloads.
 */
const redis =
  global.__redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
    // Don’t connect until first command; avoids blocking cold starts
    lazyConnect: true,
    // Keep offline queue so commands issued before the TCP handshake are buffered
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  })

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis
}

export default redis
