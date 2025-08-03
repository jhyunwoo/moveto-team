import { ENV } from "../types/env";
import { Context } from "hono";
import initDb from "../db";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";
import { ZodError } from "zod";
import { hashText, verifyHash } from "../lib/crypto/argon2-hash";
import { SessionController } from "./session.controller";
import { Controller } from "../types/controller";

export async function signUp(
  c: Context<ENV>,
  username: string,
  email: string,
  password: string,
): Promise<Controller> {
  const db = initDb(c.env.DB);
  // 기존에 있는 사용자인지 확인
  const checkExists = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  if (checkExists) {
    return {
      success: false,
      error: "User already exists",
    };
  }

  // 비밀번호 안전성 검사
  try {
    console.log("유효한 비밀번호:", password);
  } catch (e) {
    if (e instanceof ZodError) {
      console.error("검증 오류:", e.message);
      return {
        success: false,
        error: e.message,
      };
    }
    console.error("알 수 없는 오류:", e);
    return {
      success: false,
      error: "Error!",
    };
  }

  // 사용자 정보 생성
  try {
    await db.insert(userTable).values({
      id: crypto.randomUUID(),
      email: email,
      passwordHash: await hashText(c.env.ARGON2, password),
      name: username,
    });
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: "DB Insert Error",
    };
  }
}

export async function signIn(
  c: Context<ENV>,
  email: string,
  password: string,
): Promise<Controller> {
  const db = initDb(c.env.DB);

  const userData = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  if (!userData) {
    return {
      success: false,
      error: "이메일 또는 비밀번호가 일치하지 않습니다.",
    };
  }

  // 비밀번호가 일치할 경우
  if (!(await verifyHash(c.env.ARGON2, password, userData.passwordHash))) {
    return {
      success: false,
      error: "Error!",
    };
  }

  // 세션을 생성
  const session = new SessionController(c);

  const createSession = await session.create(userData.id);

  if (!createSession) {
    // 세션 생성이 올바르게 되지 않은 경우
    return createSession;
  }

  return {
    success: true,
  };
}

export async function signOut(c: Context<ENV>): Promise<Controller> {
  const session = new SessionController(c);
  const sessionRemove = await session.remove();
  if (!sessionRemove.success) {
    return sessionRemove;
  }

  return {
    success: true,
  };
}
