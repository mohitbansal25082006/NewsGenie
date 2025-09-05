import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['query'],
  })

// Export as 'db' for consistency with the route files
export const db = prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}