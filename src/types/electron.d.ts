export interface ElectronAPI {
	ipcRenderer: {
		on: (
			channel: string,
			listener: (event: any, ...args: any[]) => void
		) => void
		off: (
			channel: string,
			listener?: (event: any, ...args: any[]) => void
		) => void
		send: (channel: string, ...args: any[]) => void
		invoke: (channel: string, ...args: any[]) => Promise<any>
	}
	electronFS: {
		readFile: (filePath: string) => Promise<FSResult<string>>
		writeFile: (filePath: string, data: string) => Promise<FSResult<void>>
		exists: (filePath: string) => Promise<FSResult<boolean>>
		readJSON: (filePath: string) => Promise<FSResult<any>>
		writeJSON: (filePath: string, data: any) => Promise<FSResult<void>>
		mkdir: (dirPath: string) => Promise<FSResult<void>>
		readdir: (dirPath: string) => Promise<FSResult<string[]>>
		showSaveDialog: (options?: any) => Promise<DialogResult>
		showOpenDialog: (options?: any) => Promise<DialogResult>
	}
	electronApp: {
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
		) => Promise<AppPathResult>
	}
	electronImage: {
		downloadImage: (
			url: string,
			localPath: string
		) => Promise<FSResult<string>>
		getDataUrl: (localPath: string) => Promise<FSResult<string>>
	}
}

export interface FSResult<T> {
	success: boolean
	data?: T
	exists?: boolean
	error?: string
}

export interface DialogResult {
	success: boolean
	canceled?: boolean
	filePath?: string
	filePaths?: string[]
	error?: string
}

export interface AppPathResult {
	success: boolean
	path?: string
	error?: string
}

declare global {
	interface Window {
		ipcRenderer: ElectronAPI['ipcRenderer']
		electronFS: ElectronAPI['electronFS']
		electronApp: ElectronAPI['electronApp']
		electronImage: ElectronAPI['electronImage']
	}
}
