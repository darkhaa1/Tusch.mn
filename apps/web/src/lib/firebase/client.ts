"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";

const FIREBASE_APP_NAME = "tusch";

function readConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

/**
 * Returns the Firebase Auth instance for the browser, or `null` when the
 * four `NEXT_PUBLIC_FIREBASE_*` env vars are not all set, or when called
 * during SSR.
 *
 * Cached so HMR does not re-init the app on every render.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (cachedAuth) return cachedAuth;

  const config = readConfig();
  if (!config) return null;

  if (!cachedApp) {
    const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
    cachedApp = existing ?? initializeApp(config, FIREBASE_APP_NAME);
  }

  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}

/**
 * Cheap synchronous check that callers can use to decide whether to show
 * the phone-auth UI at all. Does not initialize the SDK.
 */
export function isFirebasePhoneAuthConfigured(): boolean {
  return readConfig() !== null;
}
