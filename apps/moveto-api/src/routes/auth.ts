import { ENV } from "../types/env";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signUpSchema } from "../lib/validations/sign-up";
import { signIn, signUp, verifyEmail } from "../controller/auth.controller";
import { verifyEmailSchema } from "../lib/validations/verify-email";
import { signInSchema } from "../lib/validations/sign-in";
import { GoogleToken, GoogleUser } from "../types/google-auth";

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

authApp.get("/google", async (c) => {
  const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
  const responseType = "code";
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/userinfo.email",
  );
  const accessType = "offline"; // For getting a refresh token

  // Construct the authorization URL manually
  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?response_type=${responseType}&client_id=${encodeURIComponent(c.env.GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(`${c.env.API_URL}/auth/callback/google`)}&scope=${scope}&access_type=${accessType}`;
  return c.redirect(authUrl);
});

authApp.get("/callback/google", async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return c.text("Authorization code not found", 400);
  }

  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${c.env.API_URL}/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenResponse.json()) as GoogleToken;

  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });
  const userInfo = await res.json() as GoogleUser
  console.log(userInfo);

  if (!tokenData.access_token) {
    return c.text("Failed to obtain access token", 400);
  }
  return c.text("User account created successfully.");
});

export default authApp;
