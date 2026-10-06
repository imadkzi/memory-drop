import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaKey?: string;
};

/**
 * Busts the hot-reload singleton when `prisma generate` adds models/fields.
 * Include core model enums so new tables also invalidate the cache.
 */
const schemaKey = [
  ...Object.values(Prisma.WeddingScalarFieldEnum),
  ...Object.values(Prisma.WeddingAdminScalarFieldEnum),
  ...Object.values(Prisma.WeddingAdminInviteScalarFieldEnum),
  ...Object.values(Prisma.MediaScalarFieldEnum),
  ...Object.values(Prisma.UserScalarFieldEnum),
].join(",");

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaSchemaKey !== schemaKey
  ) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaSchemaKey = schemaKey;
  }

  return globalForPrisma.prisma;
}

/**
 * Proxy so imports always hit the current client after a schema regenerates,
 * instead of holding a stale instance from first module evaluation.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
