import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const userTable = sqliteTable("user_table", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: int("createdAt", { mode: "timestamp_ms" }).$defaultFn(
    () => new Date(),
  ),
});

export const userRelation = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
}));

export const sessionTable = sqliteTable("session_table", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId").references(() => userTable.id),
  expiresAt: int("expiresAt", { mode: "timestamp_ms" }),
});

export const sessionRelation = relations(sessionTable, ({ one }) => ({
  author: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));
