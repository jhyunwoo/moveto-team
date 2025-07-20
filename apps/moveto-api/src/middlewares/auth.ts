import { createMiddleware } from "hono/factory";
import { Bindings } from "../types/bindings";
import { deleteCookie, getCookie } from "hono/cookie";
import { Variables } from "../types/variables";
import { encryptText, importCryptoKey } from "../lib/aes-256";
import revalidateSession from "../lib/auth/revalidate-session";
import initDb from "../db";
import setSession from "../lib/auth/set-session";

/**
 * 세션 작동 방식
 * 로그인 -> 새로운 세션 발급 -> KV에 키를 session의 id를 암호화 한 값을 넣고 value에 세션의 만료 시간을 저장
 * 사용자 요청시 middleware에서 사용자 쿠키에 있는 세션 값을 가져옴
 * 세션 값을 KV에서 찾아서 있을 경우 유효한 세션
 * KV에 세션 값이 없을 경우 유효하지 않은 세션
 * middleware에서 세션의 유효기간이 7일 미만으로 남았을 경우 새로 세션 발급 후 갱신
 * 갱신 후 이전 세션은 삭제
 * KV에서도 삭제
 *
 * 세션 값 활용을 위해선 복호화 후 db에서 세션 id를 찾아야 함
 */

export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const session = getCookie(c, "session");
  console.log("session", session);
  // session 쿠키가 존재할 경우
  if (session) {
    // KV에 저장된 세션이 있는지 확인
    const checkSession = await c.env.KV.get(session);
    console.log("checkSession", checkSession);
    // 올바른 세션일 경우
    if (checkSession) {
      // kv에 저장된 만료일을 가져옴
      const expiresAt = new Date(checkSession);
      // 만약 만료일이 넉넉하다면
      if (new Date() < expiresAt) {
        // 세션 값 저장
        c.set("session", session);

        // session 만료가 7일 안쪽으로 남았을 경우 갱신
        expiresAt.setDate(expiresAt.getDate() - 7);
        if (new Date() > expiresAt) {
          const db = initDb(c.env.DB);
          // 세션 갱신
          const revalidatedSession = await revalidateSession(c, db, session);

          // 갱신 후 갱신된 데이터를 반영
          if (revalidatedSession) {
            // 갱신한 세션 반영
            await setSession(
              c,
              await encryptText(
                revalidatedSession[0].id,
                await importCryptoKey(c.env.AES_KEY),
              ),
              revalidatedSession[0].expiresAt,
            );
            // 이전 세션 값을 KV에서 삭제
            await c.env.KV.delete(session);
          }
        }
      } else {
        c.set("session", null);
      }
    } else {
      c.set("session", null);
      deleteCookie(c, "session");
    }
  } else {
    c.set("session", null);
    deleteCookie(c, "session");
  }

  console.log(c.get("session"));
  await next();
});
