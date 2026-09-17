import tseslint from "typescript-eslint";
export default tseslint.config(
  { ignores: ["dist/**", "**/dist/**", "node_modules/**"] },
  ...tseslint.configs.recommended,
);
