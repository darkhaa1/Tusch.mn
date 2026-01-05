"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { oauthLogin } from "./lib/api";

export function AuthSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== "authenticated") {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return; // déjà sync

    const authUser = session?.user as any;
    const email = authUser?.email;
    const provider = authUser?.provider || "google";

    const displayName = authUser?.name || "";
    const [derivedFirst, ...rest] = displayName.split(" ");
    const derivedLast = rest.join(" ");
    const firstName = authUser?.firstname || authUser?.firstName || derivedFirst || "Google";
    const lastName = authUser?.lastname || authUser?.lastName || derivedLast || "User";
    const avatarUrl = authUser?.image || undefined;

    if (!email) return;

    syncedRef.current = true;

    (async () => {
      try {
        await oauthLogin({
          email,
          firstName,
          lastName,
          provider,
          avatarUrl,
        });
        // Ensure UI picks up the new backend session set by oauthLogin
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
      } catch (e) {
        console.error("Auth sync failed", e);
        syncedRef.current = false;
      }
    })();
  }, [status, session]);

  return null;
}
