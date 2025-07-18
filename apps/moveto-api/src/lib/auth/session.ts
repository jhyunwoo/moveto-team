import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { User } from "./user";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sessionsTable, usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { Context } from "hono";

export async function validateSessionToken(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const row = await db
    .select({
      session: {
        id: sessionsTable.id,
        userId: sessionsTable.userId,
        expiresAt: sessionsTable.expiresAt,
      },
      user: {
        id: usersTable.id,
        githubId: usersTable.githubId,
        email: usersTable.email,
        username: usersTable.username,
      },
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId));

  if (row.length === 0) {
    return { session: null, user: null };
  }
  const sessionData = row[0];
  const session: Session = {
    ...sessionData.session,
    expiresAt: new Date(sessionData.session.expiresAt * 1000),
  };
  const user: User = sessionData.user;
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionsTable)
      .set({
        expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
      })
      .where(eq(sessionsTable.id, session.id));
  }
  return { session, user };
}

export const getCurrentSession = async (
  c: Context,
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
): Promise<SessionValidationResult> => {
  const token = getCookie(c, "session");
  console.log("session", token);
  if (token === undefined) {
    return { session: null, user: null };
  }
  return await validateSessionToken(db, token);
};

export async function invalidateSession(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  sessionId: string,
): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function invalidateUserSessions(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  userId: string,
): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}

export function setSessionTokenCookie(
  c: Context,
  token: string,
  expiresAt: Date,
): void {
  setCookie(c, "session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(c: Context): void {
  setCookie(c, "session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  return encodeBase32(tokenBytes).toLowerCase();
}

export async function createSession(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionsTable).values({
    id: session.id,
    userId: session.userId,
    expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
  });
  return session;
}

export interface Session {
  id: string;
  expiresAt: Date;
  userId: string;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
