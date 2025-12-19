import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
createRequire(import.meta.url);
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
    width: 1440,
    height: 810,
    minWidth: 1024,
    minHeight: 768
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
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
  ipcMain.handle(
    "fs:writeFile",
    async (_, filePath, data) => {
      try {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, data, "utf-8");
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  );
  ipcMain.handle("fs:exists", async (_, filePath) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
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
      return { success: true, data: files };
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
  ipcMain.handle(
    "image:download",
    async (_, url, localPath) => {
      try {
        const dir = path.dirname(localPath);
        await fs.mkdir(dir, { recursive: true });
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(localPath, buffer);
        return { success: true, path: localPath };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  );
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
}
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
