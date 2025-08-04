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
  // session에 kv 안에 있는 데이터 저장
  const sessionData = JSON.parse(sessionKv) as Session;

  const now = new Date();
  const expiresAt = new Date(sessionData.expiresAt);

  if (expiresAt < now) {
    const session = new SessionController(c);
    await session.remove();
    return c.json({ error: "Session expired" }, { status: 401 });
  }

  // 7일(밀리초 단위)
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // 만료 7일 전 시점 계산
  const needRevalidate = new Date(expiresAt.getTime() - sevenDaysMs);

  if (needRevalidate < now) {
    console.log("Revalidate Session");
    const session = new SessionController(c);
    await session.revalidate(sessionId);
  }

  // 세션 데이터 variable 에 저장
  c.set("session", sessionData);
  return next();
});
