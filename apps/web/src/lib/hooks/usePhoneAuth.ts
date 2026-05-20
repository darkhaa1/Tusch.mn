"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebasePhoneAuthConfigured,
} from "@web/lib/firebase/client";

export type PhoneAuthErrorCode =
  | "invalid-phone"
  | "too-many-requests"
  | "invalid-code"
  | "code-expired"
  | "not-configured"
  | "unknown";

export interface PhoneAuthHandle {
  sendCode: (
    phoneE164: string,
  ) => Promise<{ success: true } | { success: false; code: PhoneAuthErrorCode }>;
  verifyCode: (
    code: string,
  ) =>
    | Promise<
        | { success: true; idToken: string }
        | { success: false; code: PhoneAuthErrorCode }
      >;
  reset: () => void;
  isReady: boolean;
  isSending: boolean;
  isVerifying: boolean;
  recaptchaContainerId: string;
}

const RECAPTCHA_CONTAINER_ID = "tusch-phone-recaptcha";

/**
 * Optional window-level test hook. When defined, the hook bypasses the
 * real Firebase SDK and instead uses the provided fake. Used by e2e tests
 * to avoid hitting Firebase from CI. Never set in production builds.
 */
type TestOverride = {
  sendCode: (phone: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<{ idToken: string } | null>;
};

declare global {
  interface Window {
    __tuschPhoneAuthTestOverride?: TestOverride;
  }
}

function mapFirebaseError(err: unknown): PhoneAuthErrorCode {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-phone-number":
      return "invalid-phone";
    case "auth/too-many-requests":
      return "too-many-requests";
    case "auth/invalid-verification-code":
      return "invalid-code";
    case "auth/code-expired":
      return "code-expired";
    default:
      return "unknown";
  }
}

export function usePhoneAuth(): PhoneAuthHandle {
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Firebase configured? If not, we still expose the API but every call
    // returns "not-configured".
    setIsReady(isFirebasePhoneAuthConfigured());
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
      confirmationRef.current = null;
    };
  }, []);

  const sendCode = useCallback<PhoneAuthHandle["sendCode"]>(
    async (phoneE164) => {
      const override = typeof window !== "undefined"
        ? window.__tuschPhoneAuthTestOverride
        : undefined;
      if (override) {
        setIsSending(true);
        try {
          const ok = await override.sendCode(phoneE164);
          return ok
            ? { success: true }
            : { success: false, code: "invalid-phone" };
        } finally {
          setIsSending(false);
        }
      }

      const auth = getFirebaseAuth();
      if (!auth) return { success: false, code: "not-configured" };

      setIsSending(true);
      try {
        if (!verifierRef.current) {
          verifierRef.current = new RecaptchaVerifier(
            auth,
            RECAPTCHA_CONTAINER_ID,
            { size: "invisible" },
          );
        }
        confirmationRef.current = await signInWithPhoneNumber(
          auth,
          phoneE164,
          verifierRef.current,
        );
        return { success: true };
      } catch (err) {
        // Reset the verifier on failure so a retry rebuilds it cleanly.
        verifierRef.current?.clear();
        verifierRef.current = null;
        return { success: false, code: mapFirebaseError(err) };
      } finally {
        setIsSending(false);
      }
    },
    [],
  );

  const verifyCode = useCallback<PhoneAuthHandle["verifyCode"]>(async (code) => {
    const override = typeof window !== "undefined"
      ? window.__tuschPhoneAuthTestOverride
      : undefined;
    if (override) {
      setIsVerifying(true);
      try {
        const result = await override.verifyCode(code);
        return result
          ? { success: true, idToken: result.idToken }
          : { success: false, code: "invalid-code" };
      } finally {
        setIsVerifying(false);
      }
    }

    if (!confirmationRef.current) {
      return { success: false, code: "unknown" };
    }
    setIsVerifying(true);
    try {
      const credential = await confirmationRef.current.confirm(code);
      const idToken = await credential.user.getIdToken();
      return { success: true, idToken };
    } catch (err) {
      return { success: false, code: mapFirebaseError(err) };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    verifierRef.current?.clear();
    verifierRef.current = null;
    confirmationRef.current = null;
  }, []);

  return {
    sendCode,
    verifyCode,
    reset,
    isReady,
    isSending,
    isVerifying,
    recaptchaContainerId: RECAPTCHA_CONTAINER_ID,
  };
}
