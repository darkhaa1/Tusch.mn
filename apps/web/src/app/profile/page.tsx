"use client";

import { Suspense, useMemo } from "react";
import { useSession } from "next-auth/react";
import AppShell from "@web/components/layout/AppShell";
import { ProfileHeader } from "@web/features/profile/components/ProfileHeader";
import { ProfileTabs } from "@web/features/profile/components/ProfileTabs";
import { UnverifiedEmailBanner } from "@web/features/auth/UnverifiedEmailBanner";
import { useCurrentUser } from "@web/lib/hooks/useApi";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: currentUser } = useCurrentUser();
  const sessionUser = session?.user as any;
  const headerUser = useMemo(() => {
    if (!currentUser) return currentUser;
    return {
      ...currentUser,
      avatarUrl:
        currentUser.avatarUrl ||
        sessionUser?.image ||
        sessionUser?.picture ||
        sessionUser?.avatarUrl ||
        null,
    };
  }, [currentUser, sessionUser]);

  const effectiveRole = useMemo(() => currentUser?.role || "CLIENT", [currentUser?.role]);
  void effectiveRole;

  return (
    <AppShell>
      <div className="space-y-4">
        <UnverifiedEmailBanner />
        <ProfileHeader user={headerUser} />
        <Suspense fallback={null}>
          <ProfileTabs user={currentUser} />
        </Suspense>
      </div>
    </AppShell>
  );
}
