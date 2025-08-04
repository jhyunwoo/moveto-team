import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const userTable = sqliteTable("user_table", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerification: int("emailVerification", { mode: "timestamp_ms" }),
  passwordHash: text("passwordHash").notNull(),
  createdAt: int("createdAt", { mode: "timestamp_ms" }).$defaultFn(
    () => new Date(),
  ),
});

export const userRelation = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
  emailVerifications: many(emailVerificationTable),
}));

export const emailVerificationTable = sqliteTable("emailVerification", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => userTable.id),
  code: text("code").notNull(),
  expiresAt: int("expiresAt", { mode: "timestamp_ms" }).notNull(),
  active: int("active", { mode: "boolean" }).default(true),
});

export const emailVerificationRelation = relations(
  emailVerificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [emailVerificationTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const sessionTable = sqliteTable("session_table", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId").references(() => userTable.id),
  expiresAt: int("expiresAt", { mode: "timestamp_ms" }),
});

export const sessionRelation = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));
