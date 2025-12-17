import {app, BrowserWindow, ipcMain, dialog} from 'electron'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, 'public')
	: RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
	win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.mjs'),
		},
		width: 1024,
		height: 768,
		minWidth: 1024,
		minHeight: 768,
	})

	// Test active push message to Renderer-process.
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send(
			'main-process-message',
			new Date().toLocaleString()
		)
	})

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL)
	} else {
		// win.loadFile('dist/index.html')
		win.loadFile(path.join(RENDERER_DIST, 'index.html'))
	}
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
		win = null
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

app.whenReady().then(() => {
	createWindow()
	setupIpcHandlers()
})

// --------- IPC Handlers for filesystem operations ---------
function setupIpcHandlers() {
	// Read file as text
	ipcMain.handle('fs:readFile', async (_, filePath: string) => {
		try {
			const data = await fs.readFile(filePath, 'utf-8')
			return {success: true, data}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Write file as text
	ipcMain.handle(
		'fs:writeFile',
		async (_, filePath: string, data: string) => {
			try {
				// Ensure directory exists
				const dir = path.dirname(filePath)
				await fs.mkdir(dir, {recursive: true})
				await fs.writeFile(filePath, data, 'utf-8')
				return {success: true}
			} catch (error) {
				return {success: false, error: error.message}
			}
		}
	)

	// Check if file exists
	ipcMain.handle('fs:exists', async (_, filePath: string) => {
		try {
			await fs.access(filePath)
			return {success: true, exists: true}
		} catch {
			return {success: true, exists: false}
		}
	})

	// Read JSON file
	ipcMain.handle('fs:readJSON', async (_, filePath: string) => {
		try {
			const data = await fs.readFile(filePath, 'utf-8')
			const json = JSON.parse(data)
			return {success: true, data: json}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Write JSON file
	ipcMain.handle('fs:writeJSON', async (_, filePath: string, data: any) => {
		try {
			const dir = path.dirname(filePath)
			await fs.mkdir(dir, {recursive: true})
			await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
			return {success: true}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Create directory
	ipcMain.handle('fs:mkdir', async (_, dirPath: string) => {
		try {
			await fs.mkdir(dirPath, {recursive: true})
			return {success: true}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Read directory
	ipcMain.handle('fs:readdir', async (_, dirPath: string) => {
		try {
			const files = await fs.readdir(dirPath)
			return {success: true, data: files}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Show save dialog
	ipcMain.handle('dialog:showSaveDialog', async (_, options = {}) => {
		try {
			const result = await dialog.showSaveDialog(win!, {
				filters: [
					{name: 'JSON Files', extensions: ['json']},
					{name: 'All Files', extensions: ['*']},
				],
				...options,
			})
			return {success: true, ...result}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Show open dialog
	ipcMain.handle('dialog:showOpenDialog', async (_, options = {}) => {
		try {
			const result = await dialog.showOpenDialog(win!, {
				properties: ['openFile'],
				filters: [
					{name: 'JSON Files', extensions: ['json']},
					{name: 'All Files', extensions: ['*']},
				],
				...options,
			})
			return {success: true, ...result}
		} catch (error) {
			return {success: false, error: error.message}
		}
	})

	// Get app paths (appData, userData, etc.)
	ipcMain.handle(
		'app:getPath',
		async (
			_,
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
		) => {
			try {
				const pathValue = app.getPath(pathName)
				return {success: true, path: pathValue}
			} catch (error) {
				return {success: false, error: error.message}
			}
		}
	)
}
