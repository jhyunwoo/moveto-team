import { setCookie } from "hono/cookie";
import { Context } from "hono";
import { Bindings } from "../../types/bindings";
import { Variables } from "../../types/variables";

export default async function setSession(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  encryptedSessionId: string,
  expiresAt: Date,
) {
  await c.env.KV.put(encryptedSessionId, expiresAt.toISOString());
  setCookie(c, "session", encryptedSessionId, {
    secure: c.var.ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
  });
}
