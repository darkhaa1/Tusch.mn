import { apiFetch } from "./base";
import type { VerificationStatusResponse } from "./types";

export async function fetchVerificationStatus(): Promise<VerificationStatusResponse> {
  return apiFetch<VerificationStatusResponse>("/users/verification/status", {
    method: "GET",
  });
}

export async function submitVerificationDocument(file: File): Promise<{ status: string }> {
  const formData = new FormData();
  formData.append("document", file);
  return apiFetch<{ status: string }>("/users/verification/submit", {
    method: "POST",
    body: formData,
  });
}
