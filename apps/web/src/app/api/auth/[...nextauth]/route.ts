// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  // 🔒 Removed trustHost: true (security risk - CSRF bypass)
  // Instead, configure NEXTAUTH_URL properly in .env
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
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.picture = (user as any)?.image ?? token.picture;
        token.firstname = (user as any)?.firstname ?? token.firstname;
        token.lastname = (user as any)?.lastname ?? token.lastname;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as {
          given_name?: string;
          family_name?: string;
          picture?: string;
          email?: string;
          name?: string;
        };
        token.name = googleProfile?.name ?? token.name;
        token.email = googleProfile?.email ?? token.email;
        token.firstname = googleProfile?.given_name ?? token.firstname;
        token.lastname = googleProfile?.family_name ?? token.lastname;
        token.picture = googleProfile?.picture ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.provider = typeof token.provider === "string" ? token.provider : session.user.provider;
        session.user.firstname = typeof token.firstname === "string" ? token.firstname : session.user.firstname;
        session.user.lastname = typeof token.lastname === "string" ? token.lastname : session.user.lastname;
        session.user.image =
          session.user.image ?? (typeof token.picture === "string" ? token.picture : undefined);
        session.user.email = session.user.email ?? (typeof token.email === "string" ? token.email : undefined);
        session.user.name = session.user.name ?? (typeof token.name === "string" ? token.name : undefined);
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
