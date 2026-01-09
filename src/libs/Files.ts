import {FSResult, TReadDirEntry} from '../types/electron'
import Path from './Paths'

async function exists(path: string) {
	const p = await Path.AppRoot()
	if (!p) return {success: false, exists: false}
	const subPath = path.startsWith('/') ? path : '/' + path
	const result: FSResult<boolean> = await window.electronFS.exists(p + subPath)
	return {
		success: result.success,
		exists: result.success ? result.exists! : false,
	}
}

async function read<T>(path: string): Promise<T | null> {
	const p = await Path.AppRoot()
	if (!p) return null
	const subPath = path.startsWith('/') ? path : '/' + path
	const result: FSResult<T> = await window.electronFS.readJSON(p + subPath)
	if (result.success && result.data) {
		return result.data
	} else {
		console.error('Failed to read file:', result.error)
		return null
	}
}

async function readRaw(path: string): Promise<string | null> {
	const p = await Path.AppRoot()
	if (!p) return null
	const subPath = path.startsWith('/') ? path : '/' + path
	const result: FSResult<string> = await window.electronFS.readFile(p + subPath)
	if (result.success && result.data) {
		return result.data
	} else {
		console.error('Failed to read RAW file:', result.error)
		return null
	}
}

async function readDir(path: string): Promise<TReadDirEntry[] | null> {
	const p = await Path.AppRoot()
	if (!p) return null
	const subPath = path.startsWith('/') ? path : '/' + path
	const result: FSResult<TReadDirEntry[]> = await window.electronFS.readdir(p + subPath)
	if (result.success && result.data) {
		return result.data
	} else {
		console.error('Failed to read directory:', result.error)
		return null
	}
}

async function write<T>(path: string, data: T): Promise<boolean> {
	const p = await Path.AppRoot()
	if (!p) return false
	const subPath = path.startsWith('/') ? path : '/' + path
	// Convert to plain object to avoid Vue Proxy cloning issues with IPC
	const plainData = JSON.parse(JSON.stringify(data))
	const result = await window.electronFS.writeJSON(p + subPath, plainData)
	if (!result.success) {
		console.error('Failed to write file:', result.error)
		return false
	}
	return true
}

async function writeRaw(path: string, data: string): Promise<boolean> {
	const p = await Path.AppRoot()
	if (!p) return false
	const subPath = path.startsWith('/') ? path : '/' + path
	const result = await window.electronFS.writeFile(p + subPath, data)
	if (!result.success) {
		console.error('Failed to write RAW file:', result.error)
		return false
	}
	return true
}

async function makeDir(path: string): Promise<boolean> {
	const p = await Path.AppRoot()
	if (!p) return false
	const subPath = path.startsWith('/') ? path : '/' + path
	const result = await window.electronFS.mkdir(p + subPath)
	if (!result.success) {
		console.error('Failed to create directory:', result.error)
		return false
	}
	return true
}

async function save(data: any, filename: string) {
	const result = await window.electronFS.showSaveDialog({
		defaultPath: filename,
		filters: [
			{name: 'JSON Files', extensions: ['json']},
			{name: 'All Files', extensions: ['*']},
		],
	})
	if (result.success && !result.canceled && result.filePath) {
		return await window.electronFS.writeJSON(result.filePath, data)
	}
	return {success: false, error: 'Save canceled or failed'}
}

async function load() {
	const result = await window.electronFS.showOpenDialog({
		properties: ['openFile'],
		filters: [
			{name: 'JSON Files', extensions: ['json']},
			{name: 'All Files', extensions: ['*']},
		],
	})

	if (result.success && !result.canceled && result.filePaths?.length) {
		return await window.electronFS.readJSON(result.filePaths[0])
	}

	return {success: false, error: 'Load canceled or failed'}
}

async function remove(path: string) {
	const p = await Path.AppRoot()
	if (!p) return false
	const subPath = path.startsWith('/') ? path : '/' + path
	const result = await window.electronFS.deleteFile(p + subPath)
	return result.success as boolean
}

async function moveOrRename(oldPath: string, newPath: string) {
	const p = await Path.AppRoot()
	if (!p) return false
	const subOldPath = oldPath.startsWith('/') ? oldPath : '/' + oldPath
	const subNewPath = newPath.startsWith('/') ? newPath : '/' + newPath
	const result = await window.electronFS.renameFile(p + subOldPath, p + subNewPath)
	return result.success as boolean
}

async function removeDir(path: string) {
	const p = await Path.AppRoot()
	if (!p) return false
	const subPath = path.startsWith('/') ? path : '/' + path
	const result = await window.electronFS.removeDir(p + subPath)
	return result.success as boolean
}

const Files = {
	exists,
	read,
	readRaw,
	readDir,
	write,
	writeRaw,
	makeDir,
	save,
	load,
	remove,
	removeDir,
	moveOrRename,
}
export default Files

export const RUnsafePathCharactersRegex = /[\\/:*?"<>|]/g
export function GenerateUniqueIDHash(): string {
	const array = new Uint8Array(16)
	window.crypto.getRandomValues(array)
	return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('')
}
