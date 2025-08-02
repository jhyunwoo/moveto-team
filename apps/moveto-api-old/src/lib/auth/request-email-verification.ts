import createVerificationCode from "./create-verification-code";
import { emailVerificationTable } from "../../db/schema";
import sendEmailVerification from "./send-email-verification";
import { DrizzleDb } from "../../db";
import { eq } from "drizzle-orm";

export default async function requestEmailVerification(
  db: DrizzleDb,
  apiKey: string,
  userId: string,
  email: string,
) {
  // 인증 코드
  const verifyCode = createVerificationCode();
  // 인증 코드 만료 시간 계산
  const now = new Date(); // 현재 시간
  const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

  // 이전 인증 정보를 찾음
  const prevVerifications = await db.query.emailVerificationTable.findFirst({
    where: eq(emailVerificationTable.userId, userId),
  });

  // 이전 인증 정보가 있다면 인증 정보 삭제
  if (prevVerifications) {
    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.id, prevVerifications.id));
  }

  await Promise.all([
    // 이메일 인증 정보 생성
    db.insert(emailVerificationTable).values({
      code: verifyCode,
      expiresAt: fiveMinutesLater,
      userId: userId,
    }),
    // 이메일 전송
    sendEmailVerification(apiKey, email, verifyCode),
  ]);
}
