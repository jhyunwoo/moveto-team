import { DrizzleDb } from "../../db";
import { eq } from "drizzle-orm";
import { sessionsTable } from "../../db/schema";
import createSession from "./create-session";
import { Context } from "hono";

export default async function revalidateSession(
  c: Context,
  db: DrizzleDb,
  sessionId: string,
) {
  const prevSession = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, sessionId),
  });

  if (!prevSession) {
    return;
  }

  // delete prev session
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

  // create new session
  return createSession(c, db, prevSession.userId);
}
