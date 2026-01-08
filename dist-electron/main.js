import { app, BrowserWindow, session, ipcMain, dialog, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname$1, "preload.mjs")
    },
    width: 1512,
    height: 912,
    minWidth: 1284,
    minHeight: 768
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = VITE_DEV_SERVER_URL ? (
      // Development
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; font-src 'self' data:; connect-src 'self' ws: https://db.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; object-src 'none'"
    ) : (
      // Production
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; font-src 'self'; connect-src 'self' https://db.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; object-src 'none'"
    );
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp]
      }
    });
  });
  createWindow();
  setupIpcHandlers();
});
function setupIpcHandlers() {
  ipcMain.handle("fs:readFile", async (_, filePath) => {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:writeFile", async (_, filePath, data) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, data, "utf-8");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:exists", async (_, filePath) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  });
  ipcMain.handle("fs:deleteFile", async (_, filePath) => {
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:removeDir", async (_, dirPath) => {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:renameFile", async (_, oldPath, newPath) => {
    try {
      const dir = path.dirname(newPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.rename(oldPath, newPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:readJSON", async (_, filePath) => {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const json = JSON.parse(data);
      return { success: true, data: json };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:writeJSON", async (_, filePath, data) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:mkdir", async (_, dirPath) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("fs:readdir", async (_, dirPath) => {
    try {
      const files = await fs.readdir(dirPath);
      const filesWithStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          const ext = path.extname(file);
          return {
            fileName: ext ? file.slice(0, -ext.length) : file,
            fileExtension: ext,
            creationDate: stats.birthtime.toISOString(),
            isDirectory: stats.isDirectory()
          };
        })
      );
      return { success: true, data: filesWithStats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("dialog:showSaveDialog", async (_, options = {}) => {
    try {
      const result = await dialog.showSaveDialog(win, {
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        ...options
      });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("dialog:showOpenDialog", async (_, options = {}) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ["openFile"],
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        ...options
      });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle(
    "app:getPath",
    async (_, pathName) => {
      try {
        const pathValue = app.getPath(pathName);
        return { success: true, path: pathValue };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  );
  ipcMain.handle("image:download", async (_, url, localPath) => {
    try {
      const dir = path.dirname(localPath);
      await fs.mkdir(dir, { recursive: true });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(localPath, buffer);
      return { success: true, path: localPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("image:getDataUrl", async (_, localPath) => {
    try {
      const buffer = await fs.readFile(localPath);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return { success: true, data: dataUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("shell:openExternal", async (_, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle("shell:openPath", async (_, path2) => {
    try {
      await shell.openPath(path2);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
