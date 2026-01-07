import { app as u, BrowserWindow as h, session as v, ipcMain as n, dialog as m, shell as g } from "electron";
import { fileURLToPath as S } from "node:url";
import c from "node:path";
import a from "node:fs/promises";
const w = c.dirname(S(import.meta.url));
process.env.APP_ROOT = c.join(w, "..");
const l = process.env.VITE_DEV_SERVER_URL, j = c.join(process.env.APP_ROOT, "dist-electron"), y = c.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = l ? c.join(process.env.APP_ROOT, "public") : y;
let i;
function _() {
  i = new h({
    icon: c.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: c.join(w, "preload.mjs")
    },
    width: 1512,
    height: 912,
    minWidth: 1284,
    minHeight: 768
  }), i.webContents.setWindowOpenHandler(({ url: r }) => (g.openExternal(r), { action: "deny" })), i.webContents.on("did-finish-load", () => {
    i == null || i.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), l ? i.loadURL(l) : i.loadFile(c.join(y, "index.html"));
}
u.on("window-all-closed", () => {
  process.platform !== "darwin" && (u.quit(), i = null);
});
u.on("activate", () => {
  h.getAllWindows().length === 0 && _();
});
u.whenReady().then(() => {
  v.defaultSession.webRequest.onHeadersReceived((r, s) => {
    const e = l ? (
      // Development
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; font-src 'self' data:; connect-src 'self' ws: https://db.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; object-src 'none'"
    ) : (
      // Production
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; font-src 'self'; connect-src 'self' https://db.ygoprodeck.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; object-src 'none'"
    );
    s({
      responseHeaders: {
        ...r.responseHeaders,
        "Content-Security-Policy": [e]
      }
    });
  }), _(), b();
});
function b() {
  n.handle("fs:readFile", async (r, s) => {
    try {
      return { success: !0, data: await a.readFile(s, "utf-8") };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("fs:writeFile", async (r, s, e) => {
    try {
      const t = c.dirname(s);
      return await a.mkdir(t, { recursive: !0 }), await a.writeFile(s, e, "utf-8"), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), n.handle("fs:exists", async (r, s) => {
    try {
      return await a.access(s), { success: !0, exists: !0 };
    } catch {
      return { success: !0, exists: !1 };
    }
  }), n.handle("fs:deleteFile", async (r, s) => {
    try {
      return await a.unlink(s), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("fs:removeDir", async (r, s) => {
    try {
      return await a.rm(s, { recursive: !0, force: !0 }), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("fs:renameFile", async (r, s, e) => {
    try {
      const t = c.dirname(e);
      return await a.mkdir(t, { recursive: !0 }), await a.rename(s, e), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), n.handle("fs:readJSON", async (r, s) => {
    try {
      const e = await a.readFile(s, "utf-8");
      return { success: !0, data: JSON.parse(e) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("fs:writeJSON", async (r, s, e) => {
    try {
      const t = c.dirname(s);
      return await a.mkdir(t, { recursive: !0 }), await a.writeFile(s, JSON.stringify(e, null, 2), "utf-8"), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), n.handle("fs:mkdir", async (r, s) => {
    try {
      return await a.mkdir(s, { recursive: !0 }), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("fs:readdir", async (r, s) => {
    try {
      const e = await a.readdir(s);
      return { success: !0, data: await Promise.all(
        e.map(async (o) => {
          const d = c.join(s, o), p = await a.stat(d), f = c.extname(o);
          return {
            fileName: f ? o.slice(0, -f.length) : o,
            fileExtension: f,
            creationDate: p.birthtime.toISOString(),
            isDirectory: p.isDirectory()
          };
        })
      ) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("dialog:showSaveDialog", async (r, s = {}) => {
    try {
      return { success: !0, ...await m.showSaveDialog(i, {
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        ...s
      }) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("dialog:showOpenDialog", async (r, s = {}) => {
    try {
      return { success: !0, ...await m.showOpenDialog(i, {
        properties: ["openFile"],
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        ...s
      }) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle(
    "app:getPath",
    async (r, s) => {
      try {
        return { success: !0, path: u.getPath(s) };
      } catch (e) {
        return { success: !1, error: e.message };
      }
    }
  ), n.handle("image:download", async (r, s, e) => {
    try {
      const t = c.dirname(e);
      await a.mkdir(t, { recursive: !0 });
      const o = await fetch(s);
      if (!o.ok)
        throw new Error(`HTTP ${o.status}: ${o.statusText}`);
      const d = Buffer.from(await o.arrayBuffer());
      return await a.writeFile(e, d), { success: !0, path: e };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), n.handle("image:getDataUrl", async (r, s) => {
    try {
      return { success: !0, data: `data:image/jpeg;base64,${(await a.readFile(s)).toString("base64")}` };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), n.handle("shell:openExternal", async (r, s) => {
    try {
      return await g.openExternal(s), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  });
}
export {
  j as MAIN_DIST,
  y as RENDERER_DIST,
  l as VITE_DEV_SERVER_URL
};
