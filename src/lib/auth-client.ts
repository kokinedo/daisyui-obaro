import { createAuthClient } from "better-auth/react";

/**
 * Better Auth browser client. baseURL is left undefined so it targets the same
 * origin the app is served from; the auth API is mounted at /api/auth/* by the
 * catch-all server route (src/routes/api/auth/$.ts).
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
