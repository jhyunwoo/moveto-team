import { z } from "zod";

export const userSignUpSchema = z
  .object({
    userName: z.string().nonempty(),
    email: z.email(),
    password: z.string().nonempty(),
    passwordConfirm: z.string().nonempty(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"], // 에러 메시지를 이 필드에 표시
    message: "password is not match",
  });
