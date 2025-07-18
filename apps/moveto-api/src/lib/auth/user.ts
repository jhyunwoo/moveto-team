import { DrizzleD1Database } from "drizzle-orm/d1";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function createUser(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  githubId: number,
  email: string | null,
  username: string,
): Promise<User> {
  const row = await db
    .insert(usersTable)
    .values({
      githubId: githubId,
      email: email,
      username: username,
      id: uuidv4(),
    })
    .returning();
  if (row.length === 0) {
    throw new Error("Unexpected error");
  }

  return {
    id: row[0].id,
    githubId,
    email,
    username,
  };
}

export async function getUserFromGitHubId(
  db: DrizzleD1Database<typeof import("../../db/schema")> & {
    $client: D1Database;
  },
  githubId: number,
): Promise<User | null> {
  const row = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.githubId, githubId));
  if (row.length === 0) {
    return null;
  }
  return row[0];
}

export interface User {
  id: string;
  email: string | null;
  githubId: number;
  username: string;
}
