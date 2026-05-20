// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions & { trustHost?: boolean } = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
        token.adminRole = (user as any)?.adminRole ?? token.adminRole ?? 'USER';
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

      // Sync adminRole from the backend. Runs on:
      //   - the OAuth sign-in tick (account present), OR
      //   - any later tick when adminRoleSyncedAt is older than 60s and an
      //     email is known. This lets a freshly-promoted admin pick up the
      //     new role on next page load instead of requiring a full re-login.
      const roleSyncedAt =
        typeof (token as any).adminRoleSyncedAt === "number"
          ? ((token as any).adminRoleSyncedAt as number)
          : 0;
      const SYNC_TTL_MS = 60 * 1000;
      const shouldSyncRole =
        !!token.email &&
        (!!account?.provider || Date.now() - roleSyncedAt > SYNC_TTL_MS);

      if (shouldSyncRole) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3310";
          const res = await fetch(`${apiUrl}/auth/oauth-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: token.email,
              firstName: token.firstname ?? "",
              lastName: token.lastname ?? "",
              provider: account?.provider ?? token.provider ?? "google",
              avatarUrl: token.picture ?? null,
            }),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              user?: { adminRole?: string };
            };
            if (typeof data.user?.adminRole === "string") {
              token.adminRole = data.user.adminRole;
            }
            (token as any).adminRoleSyncedAt = Date.now();
          }
        } catch (err) {
          console.error("NextAuth: backend role sync failed", err);
        }
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
        session.user.adminRole = typeof token.adminRole === "string" ? token.adminRole : 'USER';
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
