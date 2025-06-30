import baseConfig, { restrictEnvAccess } from "@lev-os/eslint-config/base";
import nextjsConfig from "@lev-os/eslint-config/nextjs";
import reactConfig from "@lev-os/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
