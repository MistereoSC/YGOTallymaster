"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("electronFS", {
  readFile: (filePath) => electron.ipcRenderer.invoke("fs:readFile", filePath),
  writeFile: (filePath, data) => electron.ipcRenderer.invoke("fs:writeFile", filePath, data),
  exists: (filePath) => electron.ipcRenderer.invoke("fs:exists", filePath),
  readJSON: (filePath) => electron.ipcRenderer.invoke("fs:readJSON", filePath),
  writeJSON: (filePath, data) => electron.ipcRenderer.invoke("fs:writeJSON", filePath, data),
  mkdir: (dirPath) => electron.ipcRenderer.invoke("fs:mkdir", dirPath),
  readdir: (dirPath) => electron.ipcRenderer.invoke("fs:readdir", dirPath),
  showSaveDialog: (options) => electron.ipcRenderer.invoke("dialog:showSaveDialog", options),
  showOpenDialog: (options) => electron.ipcRenderer.invoke("dialog:showOpenDialog", options)
});
electron.contextBridge.exposeInMainWorld("electronApp", {
  getPath: (pathName) => electron.ipcRenderer.invoke("app:getPath", pathName)
});
