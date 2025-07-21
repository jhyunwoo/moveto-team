import { DrizzleDb } from "../../db";
import { eq } from "drizzle-orm";
import { sessionsTable } from "../../db/schema";
import createSession from "./create-session";
import { Context } from "hono";
import { decryptText, importCryptoKey } from "../aes-256";

export default async function revalidateSession(
  c: Context,
  db: DrizzleDb,
  sessionId: string,
) {
  const decryptedSessionId = await decryptText(sessionId, await importCryptoKey(c.env.AES_KEY));
  
  const prevSession = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, decryptedSessionId),
  });

  if (!prevSession) {
    return;
  }

  // delete prev session
  await db.delete(sessionsTable).where(eq(sessionsTable.id, decryptedSessionId));

  // create new session
  return createSession(c, db, prevSession.userId);
}
