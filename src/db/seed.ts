import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";
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
 * SEED CORRECTNESS RULES (violating any of these has shipped real broken apps —
 * keep them when you extend this seed):
 *  1. The whole seed runs in ONE transaction with a Postgres ADVISORY LOCK, so
 *     (a) a mid-run failure leaves NOTHING behind instead of a half-seeded DB,
 *     and (b) two concurrent first-requests can't both run it and collide.
 *  2. Insert FK PARENTS BEFORE CHILDREN. A row that references a user/org you
 *     insert later kills the seed with an FK violation. (This exact bug once
 *     made login redirect-loop forever: memberships referenced a user created
 *     30 lines further down, the seed died mid-run, and the guard below saw
 *     the surviving early rows and refused to ever repair it.)
 *  3. Keep the idempotency guard on the FIRST row this seed inserts (the demo
 *     user) — guarding on a later table locks a partial seed in forever.
 */

export const DEMO_EMAIL = "demo@obaro.dev";
export const DEMO_PASSWORD = "demo1234";

const DEMO_USER_ID = "usr_demo_0000000000000001";
const DEMO_ACCOUNT_ID = "acc_demo_0000000000000001";
const EPOCH = new Date("2026-01-01T00:00:00.000Z");

/** App-specific constant so unrelated apps sharing a Postgres don't contend. */
const SEED_LOCK_KEY = 823_041;

const DEMO_PROJECTS = [
  { id: "prj_demo_0000000000000001", title: "Acme Onboarding Flow", status: "active" },
  { id: "prj_demo_0000000000000002", title: "Billing Migration", status: "active" },
  { id: "prj_demo_0000000000000003", title: "Q1 Marketing Site", status: "paused" },
  { id: "prj_demo_0000000000000004", title: "Legacy API Sunset", status: "archived" },
  { id: "prj_demo_0000000000000005", title: "Mobile Beta", status: "active" },
] as const;

export async function seed(db: Db): Promise<{ seeded: boolean }> {
  // Cheap pre-check outside the transaction: the common case (already seeded)
  // costs one indexed lookup and takes no lock.
  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, DEMO_USER_ID),
  });
  if (existing) return { seeded: false };

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  return db.transaction(async (tx) => {
    // Serialize concurrent first-requests; released automatically at commit/rollback.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${SEED_LOCK_KEY})`);

    // Re-check under the lock: a concurrent request may have seeded while we waited.
    const raced = await tx.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, DEMO_USER_ID),
    });
    if (raced) return { seeded: false };

    await tx.insert(user).values({
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
    await tx.insert(account).values({
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
      await tx.insert(project).values({
        id: p.id,
        userId: DEMO_USER_ID,
        title: p.title,
        status: p.status,
        // Deterministic staggered timestamps (one day apart).
        createdAt: new Date(EPOCH.getTime() + i * 86_400_000),
      });
    }

    return { seeded: true };
  });
}
