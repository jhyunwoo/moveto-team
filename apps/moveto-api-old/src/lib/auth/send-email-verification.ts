import { Resend } from "resend";
import VerifyEmail from "@repo/transactional/emails/verify-email";

export default async function sendEmailVerification(
  apiKey: string,
  email: string,
  verificationCode: string,
) {
  const resend = new Resend(apiKey);

  return await resend.emails.send({
    from: "스토미 <stormy-verify@moveto.kr>",
    to: [email],
    subject: `스토미 이메일 인증 코드 - ${verificationCode}`,
    react: VerifyEmail({
      verificationCode: verificationCode,
      redirectUrl: "https://stormy.moveto.kr/auth/verification",
    }),
  });
}
