import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

function getEmailDomain(email: string | null | undefined): string | null {
  if (!email || !email.includes("@")) return null;
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1]! : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "helm-dev-secret-replace-in-production" : undefined),
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          orgMembers: {
            include: { org: true },
          },
        },
      });
      if (!dbUser) return session;

      const emailDomain = dbUser.emailDomain ?? getEmailDomain(dbUser.email ?? undefined);
      if (emailDomain && !dbUser.emailDomain) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { emailDomain },
        });
      }

      const member = dbUser.orgMembers[0];
      if (member) {
        Object.assign(session.user, {
          id: dbUser.id,
          orgId: member.orgId,
          organizationName: member.org.name,
          needsOnboarding: member.org.name === "",
        });
        return session;
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
        Object.assign(session.user, {
          id: dbUser.id,
          orgId: org.id,
          organizationName: org.name,
          needsOnboarding: org.name === "",
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/landing",
  },
  trustHost: true,
});

