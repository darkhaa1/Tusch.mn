const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export function resolveImageUrl(value?: string | null) {
  if (!value) return null;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  if (!apiBaseUrl) return value;
  return value.startsWith("/") ? `${apiBaseUrl}${value}` : `${apiBaseUrl}/${value}`;
}

export default resolveImageUrl;
