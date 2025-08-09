// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

// Extend the User type to include firstname and lastname
declare module "next-auth" {
  interface User {
    firstname?: string;
    lastname?: string;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
    pages: {
    signIn: '/', // ou ta page d'accueil
  },
  callbacks: {
  async jwt({ token, account, profile }) {
    if (account?.provider === 'google') {
      const googleProfile = profile as { given_name?: string; family_name?: string; picture?: string };
      token.firstname = googleProfile?.given_name;
      token.lastname = googleProfile?.family_name;
      token.picture = googleProfile?.picture;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.firstname = typeof token.firstname === "string" ? token.firstname : undefined;
      session.user.lastname = typeof token.lastname === "string" ? token.lastname : undefined;
      session.user.image = typeof token.picture === "string" ? token.picture : undefined;
    }
    return session;
  },
},
});

export { handler as GET, handler as POST };
