import { Context } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";
import { DrizzleDb } from "../../db";
import { sessionsTable } from "../../db/schema";
import { v4 as uuid } from "uuid";

export default async function createSession(
  c: Context,
  db: DrizzleDb,
  userId: string,
) {
  const info = getConnInfo(c); // info is `ConnInfo`
  const userIp = info.remote.address;

  const userDevice = c.req.header("User-Agent");

  // 세션 만료일 계산 (현재 시간 + 30일)
  const now = new Date();
  const sessionExpiresAt = new Date(now);
  sessionExpiresAt.setDate(now.getDate() + 30);

  return db
    .insert(sessionsTable)
    .values({
      id: uuid(),
      userId: userId,
      ipAddress: userIp,
      device: userDevice,
      expiresAt: sessionExpiresAt,
    })
    .returning();
}
