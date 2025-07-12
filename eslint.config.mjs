import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jquery },
      sourceType: "script",
    },
    extends: ["js/recommended"],
    plugins: { js },
    rules: { eqeqeq: "error" },
  },
]);
