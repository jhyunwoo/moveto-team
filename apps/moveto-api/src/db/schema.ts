import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    githubId: integer("id").notNull().unique(),
    email: text("email"),
    username: text("username").notNull(),
  },
  (user) => [uniqueIndex("github_id_index").on(user.githubId)],
);

export const sessionsTable = sqliteTable("session", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer("expires_at").notNull(),
});
