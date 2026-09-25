import js from "@eslint/js";
import  prettier from "eslint-plugin-prettier"
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { ignores: ["dist/**"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: {js, prettier }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      // TypeScript no tiene forma de prohibir el `any` explicito, asi que
      // esta regla + el gate de `pnpm check` son lo unico que lo frena.
      "@typescript-eslint/no-explicit-any": "warn",
      // escape hatch igual que el de tsc: sin esto los dos gates se contradicen
      // y no hay forma de ignorar un parametro que la firma te obliga a declarar.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
]);
