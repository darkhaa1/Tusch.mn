"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@web/lib/hooks/useApi";

const ONBOARDING_PATH = "/onboarding";
const EXCLUDED_PATHS = ["/onboarding", "/verify-email", "/reset-password"];

export function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    if (user.onboardingCompletedAt === null || user.onboardingCompletedAt === undefined) {
      // Only redirect if field exists (i.e. we can distinguish new vs old users)
      // onboardingCompletedAt being null means not yet completed
      if ("onboardingCompletedAt" in user) {
        router.replace(ONBOARDING_PATH);
      }
    }
  }, [user, isLoading, pathname, router]);

  return null;
}
