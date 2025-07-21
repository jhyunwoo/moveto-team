import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { encryptText, importCryptoKey } from "../lib/aes-256";
import { zValidator } from "@hono/zod-validator";
import { userSignUpSchema } from "../lib/validate-schema/user-sign-up";
import initDb from "../db";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { userSignInSchema } from "../lib/validate-schema/user-sign-in";
import { Variables } from "../types/variables";
import createSession from "../lib/auth/create-session";
import setSession from "../lib/auth/set-session";
import deleteSession from "../lib/auth/delete-session";
import { sha512PasswordHash } from "../lib/sha-512-password-hash";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

auth.post("/sign-up", zValidator("json", userSignUpSchema), async (c) => {
  const { userName, email, password } = c.req.valid("json");

  const db = initDb(c.env.DB);
  // email 중복 검사
  const findSameEmail = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (findSameEmail) {
    return c.json({ result: "Email already exists" }, { status: 400 });
  }

  // 사용자 등록
  try {
    const userId = uuidv4();
    await db.insert(usersTable).values({
      id: userId,
      userName,
      email,
      password: await sha512PasswordHash(userId, password),
    });
  } catch (err) {
    console.error(err);
    return c.json({ result: "DB Insert Error" }, { status: 500 });
  }

  return c.json({ result: "Success" });
});

auth.put("/sign-in", zValidator("json", userSignInSchema), async (c) => {
  if (c.get("session")) {
    return c.json({ result: "Already Signed In" });
  }

  const { email, password } = c.req.valid("json");
  const db = initDb(c.env.DB);

  // 사용자 탐색 및 비밀번호 확인
  const userData = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  // 사용자를 찾을 수 없을 경우 오류 반환
  if (!userData) {
    return c.json(
      { result: "Email or Password is incorrect" },
      { status: 400 },
    );
  }

  // hash 한 비밀번호와 DB에 저장된 비밀번호 값이 같을 경우 세션 생성 후 등록
  if ((await sha512PasswordHash(userData.id, password)) === userData.password) {
    // 세션 생성
    const session = await createSession(c, db, userData.id);
    // 세션 id 암호화
    const encryptedSessionId = await encryptText(
      session[0].id,
      await importCryptoKey(c.env.AES_KEY),
    );
    // 세션 쿠키에 등록 및 KV에 등록
    await setSession(c, encryptedSessionId, session[0].expiresAt);
  } else {
    return c.json(
      { result: "Email or Password is incorrect" },
      { status: 400 },
    );
  }

  return c.json({ result: "Success" });
});

auth.put("/sign-out", async (c) => {
  const db = initDb(c.env.DB);
  // 세션 삭제 및 KV 에서 값 제거
  await deleteSession(c, db, c.get("session"));

  return c.json({ result: "Success" });
});

export default auth;
