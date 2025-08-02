import { z } from "zod";

export const userSignInSchema = z.object({
  email: z.email(),
  password: z.string().nonempty(),
});
