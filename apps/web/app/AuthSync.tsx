"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function AuthSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return; // déjà sync

    const email = session?.user?.email;
    const name = session?.user?.name || "";
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    if (!email) return;

    syncedRef.current = true;

    (async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ⬅️ important pour recevoir le cookie accessToken
          body: JSON.stringify({
            email,
            firstName: firstName || "Google",
            lastName: lastName || "User",
            provider: "google",
          }),
        });
      } catch (e) {
        console.error("Auth sync failed", e);
        syncedRef.current = false;
      }
    })();
  }, [status, session]);

  return null;
}
