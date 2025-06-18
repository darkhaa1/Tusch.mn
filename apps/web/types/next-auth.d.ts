import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      firstname?: string | null;
      lastname?: string | null;
      email?: string | null;
      phone?: string | null;
      id?: string;
      accountType?: string;
    };
  }

  interface User extends DefaultUser {
      firstname?: string | null;
      lastname?: string | null;
      email?: string | null;
      phone?: string | null;
      id?: string;
      accountType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
