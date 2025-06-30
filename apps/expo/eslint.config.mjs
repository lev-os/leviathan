import baseConfig from "@lev-os/eslint-config/base";
import reactConfig from "@lev-os/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
