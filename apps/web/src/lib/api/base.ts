const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const serverApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3310";

// Small wrapper to normalize errors and JSON parsing.
export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = new Headers(options.headers || {});
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (payload as any)?.message || payload || "Request failed";
    throw new Error(typeof message === "string" ? message : "Request failed");
  }

  return payload as TResponse;
}
