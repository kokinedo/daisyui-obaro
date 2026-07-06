import { hashPassword } from "better-auth/crypto";
import type { Db } from "#/db/index";
import { user, account, project } from "#/db/schema";

/**
 * Deterministic demo seed.
 *
 * Serverless cold-starts must be able to reproduce an identical demo dataset, so
 * every id, email, title and timestamp below is fixed. The one non-fixed value
 * is the password hash — it is (re)computed with Better Auth's own hasher so the
 * stored verifier always accepts the demo password, regardless of the random
 * salt. Sign-in with demo@obaro.dev / demo1234 therefore always works.
 *
 * The seed is idempotent: it no-ops if the demo user already exists.
 */

export const DEMO_EMAIL = "demo@obaro.dev";
export const DEMO_PASSWORD = "demo1234";

const DEMO_USER_ID = "usr_demo_0000000000000001";
const DEMO_ACCOUNT_ID = "acc_demo_0000000000000001";
const EPOCH = new Date("2026-01-01T00:00:00.000Z");

const DEMO_PROJECTS = [
  { id: "prj_demo_0000000000000001", title: "Acme Onboarding Flow", status: "active" },
  { id: "prj_demo_0000000000000002", title: "Billing Migration", status: "active" },
  { id: "prj_demo_0000000000000003", title: "Q1 Marketing Site", status: "paused" },
  { id: "prj_demo_0000000000000004", title: "Legacy API Sunset", status: "archived" },
  { id: "prj_demo_0000000000000005", title: "Mobile Beta", status: "active" },
] as const;

export async function seed(db: Db): Promise<{ seeded: boolean }> {
  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, DEMO_USER_ID),
  });
  if (existing) return { seeded: false };

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db.insert(user).values({
    id: DEMO_USER_ID,
    name: "Demo User",
    email: DEMO_EMAIL,
    emailVerified: true,
    image: null,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  });

  // Better Auth stores the password on the credential `account` row
  // (providerId "credential", accountId === userId).
  await db.insert(account).values({
    id: DEMO_ACCOUNT_ID,
    accountId: DEMO_USER_ID,
    providerId: "credential",
    userId: DEMO_USER_ID,
    password: passwordHash,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  });

  for (let i = 0; i < DEMO_PROJECTS.length; i++) {
    const p = DEMO_PROJECTS[i];
    await db.insert(project).values({
      id: p.id,
      userId: DEMO_USER_ID,
      title: p.title,
      status: p.status,
      // Deterministic staggered timestamps (one day apart).
      createdAt: new Date(EPOCH.getTime() + i * 86_400_000),
    });
  }

  return { seeded: true };
}
