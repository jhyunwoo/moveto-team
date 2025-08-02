import { z } from "zod";

export const emailVerificationSchema = z.object({
  verificationCode: z.string(),
});
