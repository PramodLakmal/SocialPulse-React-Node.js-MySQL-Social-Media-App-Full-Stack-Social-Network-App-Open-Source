import js from "@eslint/js";
import pluginSecurity from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly", // allow console.log
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      ...pluginSecurity.configs.recommended.rules,
    },
  },
];
