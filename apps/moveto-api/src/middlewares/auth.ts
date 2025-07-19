import { createMiddleware } from "hono/factory";
import { Bindings } from "../types/bindings";
import { getCookie } from "hono/cookie";
import { Variables } from "../types/variables";
import { decryptText, importCryptoKey } from "../lib/aes-256";

export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const session = getCookie(c, "session");
  // session 쿠키가 존재할 경우
  if (session) {
    // KV에 저장된 세션이 있는지 확인
    const checkSession = await c.env.KV.get(session);
    // 올바른 세션일 경우
    if (checkSession) {
      // kv에 저장된 만료일을 가져옴
      const expiresAt = new Date(checkSession);
      // 만약 만료일이 넉넉하다면
      if (new Date() < expiresAt) {
        // 세션 값 저장
        c.set(
          "session",
          await decryptText(session, await importCryptoKey(c.env.AES_KEY)),
        );

        // session 만료가 7일 안쪽으로 남았을 경우 갱신
        expiresAt.setDate(expiresAt.getDate() - 7);
        if (new Date() > expiresAt) {
          // todo: revalidate session
          console.log("revalidate session");
        }
      } else {
        c.set("session", null);
      }
    } else {
      c.set("session", null);
    }
  } else {
    c.set("session", null);
  }
  await next();
});
