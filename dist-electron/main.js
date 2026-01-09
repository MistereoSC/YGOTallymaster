import { app as u, BrowserWindow as g, session as v, ipcMain as a, dialog as h, shell as p } from "electron";
import { fileURLToPath as S } from "node:url";
import c from "node:path";
import n from "node:fs/promises";
const y = c.dirname(S(import.meta.url));
process.env.APP_ROOT = c.join(y, "..");
const l = process.env.VITE_DEV_SERVER_URL, j = c.join(process.env.APP_ROOT, "dist-electron"), w = c.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = l ? c.join(process.env.APP_ROOT, "public") : w;
let i;
function _() {
  i = new g({
    icon: c.join(process.env.VITE_PUBLIC, "Icon.ico"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: c.join(y, "preload.mjs")
    },
    width: 1512,
    height: 912,
    minWidth: 1284,
    minHeight: 768
  }), i.removeMenu(), i.webContents.setWindowOpenHandler(({ url: r }) => (p.openExternal(r), { action: "deny" })), i.webContents.on("did-finish-load", () => {
    i == null || i.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), l ? i.loadURL(l) : i.loadFile(c.join(w, "index.html"));
}
u.on("window-all-closed", () => {
  process.platform !== "darwin" && (u.quit(), i = null);
});
u.on("activate", () => {
  g.getAllWindows().length === 0 && _();
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
  a.handle("fs:readFile", async (r, s) => {
    try {
      return { success: !0, data: await n.readFile(s, "utf-8") };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("fs:writeFile", async (r, s, e) => {
    try {
      const t = c.dirname(s);
      return await n.mkdir(t, { recursive: !0 }), await n.writeFile(s, e, "utf-8"), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), a.handle("fs:exists", async (r, s) => {
    try {
      return await n.access(s), { success: !0, exists: !0 };
    } catch {
      return { success: !0, exists: !1 };
    }
  }), a.handle("fs:deleteFile", async (r, s) => {
    try {
      return await n.unlink(s), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("fs:removeDir", async (r, s) => {
    try {
      return await n.rm(s, { recursive: !0, force: !0 }), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("fs:renameFile", async (r, s, e) => {
    try {
      const t = c.dirname(e);
      return await n.mkdir(t, { recursive: !0 }), await n.rename(s, e), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), a.handle("fs:readJSON", async (r, s) => {
    try {
      const e = await n.readFile(s, "utf-8");
      return { success: !0, data: JSON.parse(e) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("fs:writeJSON", async (r, s, e) => {
    try {
      const t = c.dirname(s);
      return await n.mkdir(t, { recursive: !0 }), await n.writeFile(s, JSON.stringify(e, null, 2), "utf-8"), { success: !0 };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), a.handle("fs:mkdir", async (r, s) => {
    try {
      return await n.mkdir(s, { recursive: !0 }), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("fs:readdir", async (r, s) => {
    try {
      const e = await n.readdir(s);
      return { success: !0, data: await Promise.all(
        e.map(async (o) => {
          const d = c.join(s, o), m = await n.stat(d), f = c.extname(o);
          return {
            fileName: f ? o.slice(0, -f.length) : o,
            fileExtension: f,
            creationDate: m.birthtime.toISOString(),
            isDirectory: m.isDirectory()
          };
        })
      ) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("dialog:showSaveDialog", async (r, s = {}) => {
    try {
      return { success: !0, ...await h.showSaveDialog(i, {
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ],
        ...s
      }) };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("dialog:showOpenDialog", async (r, s = {}) => {
    try {
      return { success: !0, ...await h.showOpenDialog(i, {
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
  }), a.handle(
    "app:getPath",
    async (r, s) => {
      try {
        return { success: !0, path: u.getPath(s) };
      } catch (e) {
        return { success: !1, error: e.message };
      }
    }
  ), a.handle("image:download", async (r, s, e) => {
    try {
      const t = c.dirname(e);
      await n.mkdir(t, { recursive: !0 });
      const o = await fetch(s);
      if (!o.ok)
        throw new Error(`HTTP ${o.status}: ${o.statusText}`);
      const d = Buffer.from(await o.arrayBuffer());
      return await n.writeFile(e, d), { success: !0, path: e };
    } catch (t) {
      return { success: !1, error: t.message };
    }
  }), a.handle("image:getDataUrl", async (r, s) => {
    try {
      return { success: !0, data: `data:image/jpeg;base64,${(await n.readFile(s)).toString("base64")}` };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("shell:openExternal", async (r, s) => {
    try {
      return await p.openExternal(s), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  }), a.handle("shell:openPath", async (r, s) => {
    try {
      return await p.openPath(s), { success: !0 };
    } catch (e) {
      return { success: !1, error: e.message };
    }
  });
}
export {
  j as MAIN_DIST,
  w as RENDERER_DIST,
  l as VITE_DEV_SERVER_URL
};
