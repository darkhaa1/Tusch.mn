// `@react-email/render` ships ESM-only and uses a dynamic import that
// Jest cannot resolve in CommonJS without --experimental-vm-modules.
// E2E tests do not exercise the rendered HTML, so a deterministic stub
// is enough. See apps/api/test/jest-e2e.json moduleNameMapper.
export async function render(): Promise<string> {
  return '<rendered-email />';
}
