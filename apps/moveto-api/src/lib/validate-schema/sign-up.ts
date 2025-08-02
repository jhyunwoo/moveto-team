import { z } from "zod";
import { passwordSchema } from "./password";

export const signUpSchema = z
  .object({
    username: z.string().nonempty(),
    password: passwordSchema,
    passwordCheck: passwordSchema,
    email: z.email("유효한 이메일 주소여야 합니다."),
  })
  .refine((data) => data.password === data.passwordCheck, {
    path: ["passwordCheck"], // 오류가 발생한 필드를 명시
    message: "비밀번호가 일치하지 않습니다.",
  });
