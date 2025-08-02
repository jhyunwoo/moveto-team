import { Context } from "hono";
import { DrizzleDb } from "../../db";
import { sessionsTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Bindings } from "../../types/bindings";
import { Variables } from "../../types/variables";
import { deleteCookie } from "hono/cookie";
import { decryptText, importCryptoKey } from "../aes-256";

export default async function deleteSession(
  c: Context<{
    Bindings: Bindings;
    Variables: Variables;
  }>,
  db: DrizzleDb,
  sessionId: string | null,
) {
  if (!sessionId) {
    return;
  }

  await db
    .delete(sessionsTable)
    .where(
      eq(
        sessionsTable.id,
        await decryptText(sessionId, await importCryptoKey(c.env.AES_KEY)),
      ),
    );
  await c.env.KV.delete(sessionId);
  deleteCookie(c, "session");
}
