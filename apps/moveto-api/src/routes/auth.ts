import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { decryptText, encryptText, importCryptoKey } from "../lib/aes-256";
import { zValidator } from "@hono/zod-validator";
import { userSignUpSchema } from "../lib/validate-schema/user-sign-up";
import initDb from "../db";
import { and, eq } from "drizzle-orm";
import { usersTable } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { hashText } from "../lib/hash-text";
import { userSignInSchema } from "../lib/validate-schema/user-sign-in";
import { Variables } from "../types/variables";
import createSession from "../lib/auth/create-session";
import setSession from "../lib/auth/set-session";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

auth.get("/", async (c) => {
  const aesKey = await importCryptoKey(c.env.AES_KEY);
  const text = "Hello World";
  const encrypted = await encryptText(text, aesKey);
  console.log("암호화된 텍스트:", encrypted);
  const decrypted = await decryptText(encrypted, aesKey); // encrypted를 복호화
  console.log("복호화된 텍스트:", decrypted);
  return c.json({ original: text, encrypted, decrypted });
});

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
    await db.insert(usersTable).values({
      id: uuidv4(),
      userName,
      email,
      password: await hashText(password),
    });
  } catch (err) {
    console.error(err);
    return c.json({ result: "DB Insert Error" }, { status: 500 });
  }

  return c.json({ result: "Success" });
});

auth.put("/sign-in", zValidator("json", userSignInSchema), async (c) => {
  console.log(c.get("session"));
  if (c.get("session")) {
    return c.json({ result: "Already Signed In" });
  }

  const { email, password } = c.req.valid("json");
  const db = initDb(c.env.DB);

  // 사용자 탐색 및 비밀번호 확인
  const userData = await db.query.usersTable.findFirst({
    where: and(
      eq(usersTable.email, email),
      eq(usersTable.password, await hashText(password)),
    ),
  });

  if (!userData) {
    return c.json(
      { result: "Email or Password is incorrect" },
      { status: 400 },
    );
  }

  const session = await createSession(c, db, userData.id);
  const encryptedSessionId = await encryptText(
    session[0].id,
    await importCryptoKey(c.env.AES_KEY),
  );
  console.log(session);

  await setSession(c, encryptedSessionId, session[0].expiresAt);

  return c.json({ result: "Success" });
});

export default auth;
