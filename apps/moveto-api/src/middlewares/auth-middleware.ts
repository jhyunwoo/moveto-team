import { createMiddleware } from "hono/factory";
import { ENV } from "../types/env";
import { getSignedCookie } from "hono/cookie";
import { Kv } from "../lib/kv";
import { Session } from "../types/session";
import { SessionController } from "../controller/session.controller";

export const authMiddleware = createMiddleware<ENV>(async (c, next) => {
  const sessionId = await getSignedCookie(c, c.env.COOKIE_SECRET, "session");

  // 세션 값이 설정되지 않은 경우
  if (!sessionId) {
    return next();
  }

  // session id 를 KV 에서 찾아봄
  const kv = new Kv(c.env.KV);
  const sessionKv = await kv.getKv(sessionId);

  // 올바르지 않은 세션의 경우 세션 값을 설정하지 않음
  if (!sessionKv) {
    return next();
  }

  // session data가 있을 경우
  // session에 kv안에 있는 데이터 저장
  const sessionData = JSON.parse(sessionKv) as Session;

  // 만약 세션 만료가 7일 미만으로 남은 경우 세션 revalidate
  const session = new SessionController(c);
  await session.revalidate(sessionId);

  // 세션 데이터 variable 에 저장
  c.set("session", sessionData);
  return next();
});
