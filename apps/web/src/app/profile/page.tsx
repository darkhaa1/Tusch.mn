"use client";

import { useMemo } from "react";
import AppShell from "@web/components/layout/AppShell";
import { ProfileHeader } from "@web/features/profile/components/ProfileHeader";
import { ProfileTabs } from "@web/features/profile/components/ProfileTabs";
import { useCurrentUser } from "@web/lib/hooks/useApi";

export default function ProfilePage() {
  const { data: currentUser } = useCurrentUser();
  const effectiveRole = useMemo(() => currentUser?.role || "CLIENT", [currentUser?.role]);
  void effectiveRole;

  return (
    <AppShell>
      <div className="space-y-4">
        <ProfileHeader user={currentUser} />
        <ProfileTabs user={currentUser} />
      </div>
    </AppShell>
  );
}
