/**
 * Provides a singleton instance of PrismaClient for database access.
 * Prevents creation of multiple instances in development to avoid excessive connections.
 */
import { PrismaClient } from './build'

/**
 * Global reference for holding the PrismaClient instance during hot reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * The shared PrismaClient instance.
 * Uses an existing global instance when available, otherwise initializes a new client.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Persist the client instance globally in non-production environments to reuse between module reloads.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Re-export generated Prisma types and helpers for convenience.
export * from './build'

/**
 * Default export of the PrismaClient singleton.
 */
export default prisma
