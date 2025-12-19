import {ipcRenderer, contextBridge} from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
	on(...args: Parameters<typeof ipcRenderer.on>) {
		const [channel, listener] = args
		return ipcRenderer.on(channel, (event, ...args) =>
			listener(event, ...args)
		)
	},
	off(...args: Parameters<typeof ipcRenderer.off>) {
		const [channel, ...omit] = args
		return ipcRenderer.off(channel, ...omit)
	},
	send(...args: Parameters<typeof ipcRenderer.send>) {
		const [channel, ...omit] = args
		return ipcRenderer.send(channel, ...omit)
	},
	invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
		const [channel, ...omit] = args
		return ipcRenderer.invoke(channel, ...omit)
	},
})

// --------- Expose filesystem API ---------
contextBridge.exposeInMainWorld('electronFS', {
	readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
	writeFile: (filePath: string, data: string) =>
		ipcRenderer.invoke('fs:writeFile', filePath, data),
	exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
	readJSON: (filePath: string) => ipcRenderer.invoke('fs:readJSON', filePath),
	writeJSON: (filePath: string, data: any) =>
		ipcRenderer.invoke('fs:writeJSON', filePath, data),
	mkdir: (dirPath: string) => ipcRenderer.invoke('fs:mkdir', dirPath),
	readdir: (dirPath: string) => ipcRenderer.invoke('fs:readdir', dirPath),
	showSaveDialog: (options?: any) =>
		ipcRenderer.invoke('dialog:showSaveDialog', options),
	showOpenDialog: (options?: any) =>
		ipcRenderer.invoke('dialog:showOpenDialog', options),
})

// --------- Expose image API ---------
contextBridge.exposeInMainWorld('electronImage', {
	downloadImage: (url: string, localPath: string) =>
		ipcRenderer.invoke('image:download', url, localPath),
	getDataUrl: (localPath: string) =>
		ipcRenderer.invoke('image:getDataUrl', localPath),
})

// --------- Expose app API ---------
contextBridge.exposeInMainWorld('electronApp', {
	getPath: (
		pathName:
			| 'home'
			| 'appData'
			| 'userData'
			| 'sessionData'
			| 'temp'
			| 'exe'
			| 'module'
			| 'desktop'
			| 'documents'
			| 'downloads'
			| 'music'
			| 'pictures'
			| 'videos'
			| 'recent'
			| 'logs'
			| 'crashDumps'
	) => ipcRenderer.invoke('app:getPath', pathName),
})

// --------- Expose shell API ---------
contextBridge.exposeInMainWorld('electronShell', {
	openExternal: (url: string) =>
		ipcRenderer.invoke('shell:openExternal', url),
})
