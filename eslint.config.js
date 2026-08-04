import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        languageOptions: { globals: globals.browser },
    },
    // 指定 tsconfigRootDir
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                // 指定根目录为你的前端 tsconfig.json 所在目录
                tsconfigRootDir: new URL(".", import.meta.url).pathname,
                project: ["./tsconfig.json", "./tsconfig.*.json"],
            },
        },
    },
    pluginReact.configs.flat.recommended,
    {
        settings: {
            react: { version: "detect" },
        },
        rules: {
            // 项目使用自动 JSX runtime (react-jsx)，无需在作用域中引入 React
            "react/react-in-jsx-scope": "off",
        },
    },
]);
