import "next-auth";

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
