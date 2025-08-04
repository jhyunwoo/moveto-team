import { ENV } from "../types/env";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signUpSchema } from "../lib/validations/sign-up";
import { signIn, signUp, verifyEmail } from "../controller/auth.controller";
import { verifyEmailSchema } from "../lib/validations/verify-email";
import { signInSchema } from "../lib/validations/sign-in";

const authApp = new Hono<ENV>();

authApp.post("/sign-up", zValidator("json", signUpSchema), async (c) => {
  const { username, email, password } = c.req.valid("json");
  const result = await signUp(c, username, email, password);

  if (!result.success || !result.verificationId) {
    return c.json(result);
  }

  return c.redirect(
    `https://www.moveto.kr/auth/verify-email/${result.verificationId}`,
  );
});

authApp.put(
  "/verify-email",
  zValidator("json", verifyEmailSchema),
  async (c) => {
    const { verificationId, code } = c.req.valid("json");

    const result = await verifyEmail(c, verificationId, code);

    if (!result.success) {
      return c.json(result);
    }

    return c.json({ result: "Success" });
  },
);

authApp.put("/sign-in", zValidator("json", signInSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  if (c.var.session?.userId) {
    return c.json({
      result: "Already sign in",
    });
  }

  const result = await signIn(c, email, password);

  if (!result.success) {
    return c.json(result, { status: 400 });
  }

  return c.json(result);
});

export default authApp;
