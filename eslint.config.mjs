import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".wxt/**",
      ".output/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts}"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs}", "eslint.config.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["docs/site/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
);
