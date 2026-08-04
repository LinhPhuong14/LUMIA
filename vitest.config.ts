import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` cố tình throw khi import ngoài điều kiện `react-server`,
      // mà vitest chạy ở node — alias sang stub rỗng để test được module server.
      "server-only": path.resolve(__dirname, "./src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
    },
    include: ["src/**/*.test.ts"],
  },
});
