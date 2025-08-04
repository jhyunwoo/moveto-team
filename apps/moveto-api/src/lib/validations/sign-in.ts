import { z } from "zod";
import { passwordSchema } from "./password";

export const signInSchema = z.object({
  password: passwordSchema,
  email: z.email("유효한 이메일 주소여야 합니다."),
});
