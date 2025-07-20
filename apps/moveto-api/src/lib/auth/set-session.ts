import { setCookie } from "hono/cookie";
import { Context } from "hono";

export default async function setSession(
  c: Context,
  encryptedSessionId: string,
  expiresAt: Date,
) {
  await c.env.KV.put(encryptedSessionId, expiresAt.toISOString());
  setCookie(c, "session", encryptedSessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
  });
}
