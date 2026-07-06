import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Drizzle schema for Postgres (via Cloudflare Hyperdrive in prod, a local
 * Postgres in dev/preview).
 *
 * The `user`, `session`, `account`, and `verification` tables match the columns
 * Better Auth's core schema expects (email/password auth, no external providers).
 * `project` is a generic SaaS demo domain table owned by a user.
 *
 * Timestamps are real Postgres `timestamp` columns; ids are text.
 */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

/**
 * Demo domain table — a generic "project" owned by a user. Fits most SaaS shapes
 * and is what the demo dashboard lists.
 */
export const project = pgTable("project", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("createdAt").notNull(),
});

export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;

export const schema = { user, session, account, verification, project };
