import { string, z } from "zod";

export const verifyEmailSchema = z.object({
  verificationId: string().nonempty(),
  code: string().min(6).max(6).nonempty(),
});
