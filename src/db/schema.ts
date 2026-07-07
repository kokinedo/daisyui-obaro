import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
  createdAt: timestamp("createdAt").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  createdAt: timestamp("createdAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  id: text("id").primaryKey(),
  ipAddress: text("ipAddress"),
  token: text("token").notNull().unique(),
  updatedAt: timestamp("updatedAt").notNull(),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  accessToken: text("accessToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  accountId: text("accountId").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  id: text("id").primaryKey(),
  idToken: text("idToken"),
  password: text("password"),
  providerId: text("providerId").notNull(),
  refreshToken: text("refreshToken"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  updatedAt: timestamp("updatedAt").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  createdAt: timestamp("createdAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updatedAt"),
  value: text("value").notNull(),
});

/**
 * Demo domain table — a generic "project" owned by a user. Fits most SaaS shapes
 * and is what the demo dashboard lists.
 */
export const project = pgTable("project", {
  createdAt: timestamp("createdAt").notNull(),
  id: text("id").primaryKey(),
  status: text("status").notNull().default("active"),
  title: text("title").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;

export const schema = { account, project, session, user, verification };
