import { initApp } from "@lev-os/desktop-main";
import { fileURLToPath } from "node:url";

if (
  process.env.NODE_ENV === "development" ||
  process.env.PLAYWRIGHT_TEST === "true" ||
  !!process.env.CI
) {
  function showAndExit(...args) {
    console.error(...args);
    process.exit(1);
  }

  process.on("uncaughtException", showAndExit);
  process.on("unhandledRejection", showAndExit);
}

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
process.env["ELECTRON_ENABLE_LOGGING"] = "true";

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

// noinspection JSIgnoredPromiseFromCall
/**
 * We resolve '@lev-os/desktop-renderer' and '@lev-os/desktop-preload'
 * here and not in '@lev-os/desktop-main'
 * to observe good practices of modular design.
 * This allows fewer dependencies and better separation of concerns in '@lev-os/desktop-main'.
 * Thus,
 * the main module remains simplistic and efficient
 * as it receives initialization instructions rather than direct module imports.
 */
initApp({
  renderer:
    process.env.MODE === "development" && !!process.env.VITE_DEV_SERVER_URL
      ? new URL(process.env.VITE_DEV_SERVER_URL)
      : {
          path: fileURLToPath(import.meta.resolve("@lev-os/desktop-renderer")),
        },

  preload: {
    path: fileURLToPath(import.meta.resolve("@lev-os/desktop-preload/exposed.mjs")),
  },
});
