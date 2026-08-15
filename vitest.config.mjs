import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: [
        "lib/utils.ts",
        "lib/auth-helpers.ts",
        "proxy.ts",
        "components/ui/button.tsx",
        "components/ui/input.tsx",
        "components/ui/label.tsx",
        "components/ui/card.tsx",
        "components/app-sidebar.tsx",
        "components/site-header.tsx",
        "components/nav-user.tsx",
        "components/dashboard-header.tsx",
      ],
      exclude: [
        "node_modules/**",
        ".next/**",
        "drizzle/**",
        "tests/**",
      ],
    },
  },
});
