import { GitHub } from "arctic";
import { Context } from "hono";

export function github(c: Context) {
  return new GitHub(
    c.env.GITHUB_CLIENT_ID,
    c.env.GITHUB_CLIENT_SECRET,
    "http://localhost:8787/auth/log-in/github/callback",
  );
}
