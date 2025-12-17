import {FSResult} from '../../types/electron'

const PATH_DATA = './data/'

async function fs_dataCore_exists(
	language: 'en' | 'de' = 'en'
): Promise<boolean> {
	const result = await window.electronFS.exists(
		PATH_DATA + `core_${language}.json`
	)
	return result.success && result.exists === true
}

async function readCoreData(language: 'en' | 'de' = 'en'): Promise<any | null> {
	const exists = await fs_dataCore_exists(language)
	if (!exists) return null

	const result = await window.electronFS.readJSON(
		PATH_DATA + `core_${language}.json`
	)
	if (result.success) {
		return result.data
	} else {
		console.error('Failed to read core data:', result.error)
		return null
	}
}

async function writeCoreData<T>(
	data: T,
	language: 'en' | 'de' = 'en'
): Promise<boolean> {
	const result = await window.electronFS.writeJSON(
		PATH_DATA + `core_${language}.json`,
		data
	)
	if (!result.success) {
		console.error('Failed to write core data:', result.error)
		return false
	}
	return true
}

async function saveDataWithDialog(data: any, defaultName = 'data.json') {
	const result = await window.electronFS.showSaveDialog({
		defaultPath: defaultName,
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
async function loadDataWithDialog() {
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

export const DATA = {
	api: {
		core: {
			exists: fs_dataCore_exists,
			read: readCoreData,
			write: writeCoreData,
		},
	},
}
