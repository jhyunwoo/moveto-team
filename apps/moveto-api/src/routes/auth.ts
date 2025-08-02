import { ENV } from "../types/env";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signUpSchema } from "../lib/validate-schema/sign-up";
import { signUp } from "../controller/auth.controller";

const authApp = new Hono<ENV>();

authApp.post("/sign-up", zValidator("json", signUpSchema), async (c) => {
  const { username, email, password } = c.req.valid("json");
  await signUp(c, username, email, password);

  return c.json({
    result: "success",
  });
});

export default authApp;
