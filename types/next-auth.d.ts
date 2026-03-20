import "next-auth";
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    orgId?: string;
    organizationName?: string;
    needsOnboarding?: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      orgId?: string;
      organizationName?: string;
      needsOnboarding?: boolean;
    };
    expires: string;
  }
}
