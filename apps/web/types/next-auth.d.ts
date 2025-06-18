import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
   interface User {
    provider?: string;
  }
  interface Session {
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
