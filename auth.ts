import type { Account } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { getPostAuthRoute } from "@/lib/routing/post-auth";

function getEmailDomain(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1]! : null;
}

/** DB + org bootstrap; runs on Node during sign-in (jwt callback), not in Edge middleware. */
async function ensureUserOrgContext(userId: string): Promise<{
  orgId?: string;
  organizationName?: string;
  needsOnboarding?: boolean;
} | null> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orgMembers: {
        include: { org: true },
      },
    },
  });
  if (!dbUser) return null;

  const emailDomain = dbUser.emailDomain ?? getEmailDomain(dbUser.email ?? undefined);
  if (emailDomain && !dbUser.emailDomain) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { emailDomain },
    });
  }

  const member = dbUser.orgMembers[0];
  if (member) {
    const org = member.org;
    const needsQuarterSetup = org.upcomingQuarterStartDate == null;
    return {
      orgId: member.orgId,
      organizationName: org.name,
      needsOnboarding: org.name === "" || needsQuarterSetup,
    };
  }
  if (emailDomain) {
    const existing = await prisma.organization.findUnique({
      where: { emailDomain },
    });
    const org =
      existing ??
      (await prisma.organization.create({
        data: { emailDomain, name: "" },
      }));
    await prisma.orgMember.create({
      data: {
        userId: dbUser.id,
        orgId: org.id,
        role: existing ? "member" : "owner",
      },
    });
    return {
      orgId: org.id,
      organizationName: org.name,
      needsOnboarding: org.name === "" || org.upcomingQuarterStartDate == null,
    };
  }
  return {};
}

/**
 * When a user already has a Google Account row, Auth.js returns early from the OAuth
 * callback without updating Prisma — so incremental consent (Drive/Docs scopes) never
 * reaches the database. The JWT callback still receives the fresh `account` payload;
 * merge it into the existing row (never clear refresh_token if Google omits it).
 */
async function persistGoogleAccountFromOAuth(
  userId: string,
  account: Account | null | undefined
): Promise<void> {
  if (!account || account.provider !== "google") return;

  const data: {
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    id_token?: string | null;
    scope?: string;
    refresh_token?: string;
  } = {};

  if (account.access_token != null) data.access_token = account.access_token;
  if (account.expires_at != null) data.expires_at = account.expires_at;
  if (account.token_type != null) data.token_type = account.token_type;
  if (account.id_token != null) data.id_token = account.id_token;
  if (account.scope != null) data.scope = account.scope;
  if (account.refresh_token != null) data.refresh_token = account.refresh_token;

  if (Object.keys(data).length === 0) return;

  await prisma.account.updateMany({
    where: { userId, provider: "google" },
    data,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "helm-dev-secret-replace-in-production" : undefined),
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Static endpoints skip OIDC discovery (fetch to /.well-known/openid-configuration).
      // Without explicit URLs, Auth.js uses a placeholder host and discovery; that fetch
      // was intermittently failing in dev (TypeError: fetch failed → error=Configuration → 500).
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "select_account",
        },
      },
      token: {
        url: "https://oauth2.googleapis.com/token",
      },
      userinfo: {
        url: "https://openidconnect.googleapis.com/v1/userinfo",
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const pathname = (() => {
        try {
          if (url.startsWith("/")) {
            return url.split("?")[0]?.split("#")[0] ?? url;
          }
          const parsed = new URL(url);
          if (parsed.origin !== new URL(baseUrl).origin) {
            return null;
          }
          return parsed.pathname;
        } catch {
          return null;
        }
      })();

      if (
        pathname === "/quarter" ||
        pathname?.startsWith("/quarter/") ||
        pathname === "/outcomes" ||
        pathname?.startsWith("/outcomes/")
      ) {
        return `${baseUrl}${getPostAuthRoute()}`;
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) {
          return url;
        }
      } catch {
        /* ignore */
      }
      return `${baseUrl}${getPostAuthRoute()}`;
    },
    async jwt({ token, user, account, trigger }) {
      if (user?.id) {
        token.sub = user.id;
      }
      const userId = token.sub;
      if (userId && typeof userId === "string" && account?.provider === "google") {
        await persistGoogleAccountFromOAuth(userId, account);
      }
      // Prisma must not run during routine JWT/session reads from Edge middleware.
      // Only refresh org claims on sign-in/up or explicit session.update() (Node / session route).
      const shouldRefreshOrgFromDb =
        !!user?.id ||
        trigger === "signIn" ||
        trigger === "signUp" ||
        trigger === "update";
      if (userId && typeof userId === "string" && shouldRefreshOrgFromDb) {
        const ctx = await ensureUserOrgContext(userId);
        if (ctx) {
          if (ctx.orgId !== undefined) token.orgId = ctx.orgId;
          if (ctx.organizationName !== undefined) token.organizationName = ctx.organizationName;
          if (ctx.needsOnboarding !== undefined) token.needsOnboarding = ctx.needsOnboarding;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (!session.user) return session;
      if (token.sub) session.user.id = token.sub;
      if (token.orgId) session.user.orgId = token.orgId;
      if (token.organizationName !== undefined) session.user.organizationName = token.organizationName;
      if (token.needsOnboarding !== undefined) session.user.needsOnboarding = token.needsOnboarding;
      return session;
    },
  },
  pages: {
    signIn: "/landing",
  },
  trustHost: true,
});

