"use client";

import { useContext } from "react";
import { ToastContext } from "@web/components/common/ToastProvider";

export function useToast() {
  return useContext(ToastContext);
}
