const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function resolveImageUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  if (!API_URL) return path;
  return path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
}

export function resolveAvatarUrl(
  path: string | null | undefined,
  fallback?: string,
): string {
  return (
    resolveImageUrl(path) ?? fallback ?? "/images/avatar-placeholder.png"
  );
}

export default resolveImageUrl;
