import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { pingRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let database: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  const redis = await pingRedis();
  const redisOk =
    redis === "ok" || (process.env.NODE_ENV !== "production" && redis === "skipped");
  const ok = database === "ok" && redisOk;

  return NextResponse.json(
    {
      status: ok ? "ok" : "error",
      checks: { database, redis },
    },
    { status: ok ? 200 : 503 },
  );
}
