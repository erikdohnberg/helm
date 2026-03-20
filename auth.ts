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
    return {
      orgId: member.orgId,
      organizationName: member.org.name,
      needsOnboarding: member.org.name === "",
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
      needsOnboarding: org.name === "",
    };
  }
  return {};
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "helm-dev-secret-replace-in-production" : undefined),
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "select_account",
        },
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
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.sub = user.id;
      }
      // Prisma must not run during routine JWT/session reads from Edge middleware.
      // Only refresh org claims on sign-in/up or explicit session.update() (Node / session route).
      const shouldRefreshOrgFromDb =
        !!user?.id ||
        trigger === "signIn" ||
        trigger === "signUp" ||
        trigger === "update";
      const userId = token.sub;
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

