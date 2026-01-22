import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: "LitCode",
    description: "AI Assistant for LeetCode",
    version: "1.0.0",
    permissions: ["storage"],
    host_permissions: ["https://leetcode.com/*"]
  },
  // We removed the runner/webExt block entirely to avoid errors.
  // You can just open the browser manually after running the script.
});
