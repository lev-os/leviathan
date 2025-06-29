import type { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { BrowserWindow } from "electron";
import type { AppInitConfig } from "../AppInitConfig.js";
import { createHandler } from "next-electron-rsc";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const localhostUrl = "http://localhost:3000"; // must match Next.js dev server

type Interceptor = ({ session }: { session: any }) => () => void;

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;
  #createInterceptor: Interceptor | null = null;

  constructor({
    initConfig,
    openDevTools = false,
  }: {
    initConfig: AppInitConfig;
    openDevTools?: boolean;
  }) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable({ app, protocol }: ModuleContext): Promise<void> {
    await app.whenReady();

    if (isDev) {
      console.log("[APP] Server Debugging Disabled, dev mode will be used");

      return;
    }

    const appPath = app.getAppPath();

    // change to your path, make sure it's added to Electron Builder files
    const standaloneDir = path.join(
      appPath,
      "..",
      "/renderer/.next",
      "standalone"
    );

    console.log(
      `[APP] Server Debugging Enabled, ${localhostUrl} will be intercepted to ${standaloneDir}`
    );

    const { createInterceptor } = createHandler({
      standaloneDir,
      localhostUrl,
      protocol,
    });

    this.#createInterceptor = createInterceptor;

    await this.restoreOrCreateWindow(true);
    app.on("second-instance", () => this.restoreOrCreateWindow(true));
    app.on("activate", () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
        webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
        preload: this.#preload.path,
      },
    });

    if (this.#createInterceptor) {
      const stopIntercept = this.#createInterceptor({
        session: browserWindow.webContents.session,
      });
    }

    if (this.#renderer instanceof URL) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

    if (window === undefined) {
      window = await this.createWindow();
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window?.show();

    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    window.focus();

    return window;
  }
}

export function createWindowManagerModule(
  ...args: ConstructorParameters<typeof WindowManager>
) {
  return new WindowManager(...args);
}
