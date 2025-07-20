import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  userName: text("userName").notNull(),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ipAddress"),
  device: text("device"),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});
