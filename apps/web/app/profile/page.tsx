"use client";

import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import { useCurrentUser } from "../hooks/useApi";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileTabs } from "../../components/profile/ProfileTabs";

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
