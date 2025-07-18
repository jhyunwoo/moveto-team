import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { generateState, OAuth2Tokens } from "arctic";
import { github } from "../lib/auth/oauth";
import { getCookie, setCookie } from "hono/cookie";
import { createUser, getUserFromGitHubId } from "../lib/auth/user";
import initDb from "../db";
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
  setSessionTokenCookie,
} from "../lib/auth/session";
import { GithubUser } from "../types/github-user";

const authApp = new Hono<{ Bindings: Bindings }>();

authApp.get("/log-in/github", async (c) => {
  const db = initDb(c.env.DB);
  const session = await getCurrentSession(c, db);
  console.log("session", session);
  const state = generateState();
  const url = github(c).createAuthorizationURL(state, []);

  // 쿠키 설정 시, 정확한 도메인/경로/sameSite 설정 확인
  setCookie(c, "github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax", // 필요시 "none"으로 변경
  });
  return c.redirect(url.toString());
});

authApp.get("/log-in/github/callback", async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = getCookie(c, "github_oauth_state") ?? null;
  if (code === null || state === null || storedState === null) {
    return c.status(400);
  }

  if (state !== storedState) {
    console.log("Authorized, Redirect to Origin");
    return c.redirect("http://localhost:3000");
  }
  console.log("code", code);
  console.log("state", state);
  console.log("storedState", storedState);

  let tokens: OAuth2Tokens;
  try {
    tokens = await github(c).validateAuthorizationCode(code);
  } catch (e) {
    // Invalid code or client credentials
    console.error(e);
    return c.status(400);
  }

  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
      Accept: "application/json",
      "User-Agent": c.req.header("User-Agent")!,
    },
  });

  if (!githubUserResponse.ok) {
    const text = await githubUserResponse.text();
    console.error("GitHub API Error:", text);
    return c.text("GitHub API Error", 500);
  }

  let githubUser;
  try {
    githubUser = (await githubUserResponse.json()) as GithubUser;
  } catch (e) {
    const text = await githubUserResponse.text();
    console.error("Failed to parse GitHub user JSON:", text);
    return c.text("GitHub returned non-JSON", 500);
  }

  const githubUserId = githubUser?.id;
  const githubUsername = githubUser?.login;
  const githubEmail = githubUser?.email;

  const db = initDb(c.env.DB);

  const existingUser = await getUserFromGitHubId(db, githubUserId);

  if (existingUser !== null) {
    const sessionToken = generateSessionToken();
    const session = await createSession(db, sessionToken, existingUser.id);
    setSessionTokenCookie(c, sessionToken, session.expiresAt);
    return c.redirect(url);
  }

  const user = await createUser(db, githubUserId, githubEmail, githubUsername);

  const sessionToken = generateSessionToken();
  const session = await createSession(db, sessionToken, user.id);
  setSessionTokenCookie(c, sessionToken, session.expiresAt);
  return c.redirect(url);
});

authApp.get("/sign-out", async (c) => {
  const db = initDb(c.env.DB);

  const { session } = await getCurrentSession(c, db);
  if (!session) {
    return c.json({ result: "Unauthorized" });
  }

  await invalidateSession(db, session.id);
  deleteSessionTokenCookie(c);
  return c.redirect("http://localhost:3000/auth/log-in");
});

authApp.get("/session", async (c) => {
  const db = initDb(c.env.DB);
  const session = await getCurrentSession(c, db);
  console.log("session", session);
  if (session.session?.id) {
    return c.json(session);
  } else {
    return c.json({ result: "Unauthorized" });
  }
});

export default authApp;
