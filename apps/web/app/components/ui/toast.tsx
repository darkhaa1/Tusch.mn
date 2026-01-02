"use client";

// Lightweight placeholder toast implementation to keep API compatibility.
// Uses console output; swap with a real toaster (e.g., sonner) when available.
type ToastOptions = {
  description?: string;
};

function logToast(type: string, title: string, options?: ToastOptions) {
  const message = [title, options?.description].filter(Boolean).join(" — ");
  console[type === "error" ? "error" : "log"](`[toast:${type}] ${message}`);
}

export const toast = {
  success: (title: string, options?: ToastOptions) => logToast("success", title, options),
  error: (title: string, options?: ToastOptions) => logToast("error", title, options),
  info: (title: string, options?: ToastOptions) => logToast("info", title, options),
};

export function Toaster() {
  return null;
}

export default toast;
