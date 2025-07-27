import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  userName: text("userName").notNull(),
  emailVerification: integer("emailVerification", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).$defaultFn(
    () => new Date(),
  ),
});

export const usersRelation = relations(usersTable, ({ one }) => ({
  emailVerification: one(emailVerificationTable),
}));

export const emailVerificationTable = sqliteTable("emailVerification", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).$defaultFn(
    () => new Date(),
  ),
});

export const emailVerificationRelations = relations(
  emailVerificationTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [emailVerificationTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ipAddress"),
  device: text("device"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
