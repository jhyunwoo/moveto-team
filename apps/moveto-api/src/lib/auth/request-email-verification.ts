import createVerificationCode from "./create-verification-code";
import { emailVerificationTable } from "../../db/schema";
import sendEmailVerification from "./send-email-verification";
import { DrizzleDb } from "../../db";
import { eq, gte } from "drizzle-orm";

export default async function requestEmailVerification(
  db: DrizzleDb,
  apiKey: string,
  userId: string,
  email: string,
) {
  const verifyCode = createVerificationCode();
  const now = new Date(); // 현재 시간
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
  const prevVerifications = await db.query.emailVerificationTable.findFirst({
    where: gte(emailVerificationTable.expiresAt, new Date().toDateString()),
  });

  if (prevVerifications) {
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.id, prevVerifications.id));
  }

  await Promise.all([
    // 이메일 인증 정보 생성
    db.insert(emailVerificationTable).values({
      code: verifyCode,
      expiresAt: fiveMinutesLater.toDateString(),
      userId: userId,
    }),
    // 이메일 전송
    sendEmailVerification(apiKey, email, verifyCode),
  ]);
}
