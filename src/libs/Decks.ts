import {jsonIdsToYdk, ydkToJsonIds} from './DeckParsers'
import Files, {RUnsafePathCharactersRegex} from './Files'
import {TCardData} from './interfaces/YGOProInterfaces'
const DECK_PATH = 'userdata/decks/'
export const DEFAULT_DECK_FOLDER = 'Default'

// ----------------------------------------------------
// #region Types
// ----------------------------------------------------

export type TDeckData = {
	name: string
	comment?: string
	main: Array<number>
	extra: Array<number>
	side: Array<number>
}
export type TDeckCardsPopulated = {main: TCardData[]; extra: TCardData[]; side: TCardData[]}

export type TDeckFolder = {
	name: string
	decks: TDeckData[]
}

const EMPTY_DECK_YDK = `
#Created with YGO Tallymaster
#main
#extra
!side
`

// #endregion
// ----------------------------------------------------
// #region Folder Operations
// ----------------------------------------------------

/**
 * Load all deck folders and their decks.
 * Decks in the root folder (for backward compatibility) are placed in "Default" folder.
 */
export async function getSavedDeckFolders(): Promise<TDeckFolder[]> {
	const folders: TDeckFolder[] = []

	// Check if the deck path exists
	const pathExists = await Files.exists(DECK_PATH)
	if (!pathExists.exists) {
		return []
	}

	const entries = await Files.readDir(DECK_PATH)
	if (!entries) return []

	// Find all .ydk files in root (for Default folder - backwards compatibility)
	const rootYdkFiles = entries.filter((e) => !e.isDirectory && e.fileExtension === '.ydk')
	rootYdkFiles.sort(
		(a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
	)

	// Load decks from root into Default folder
	const defaultDecks: TDeckData[] = []
	for (const file of rootYdkFiles) {
		const deck = await getSavedDeck(`${file.fileName}${file.fileExtension}`)
		if (deck) defaultDecks.push(deck)
	}

	// Always create Default folder (even if empty) when there's any content
	if (defaultDecks.length > 0 || entries.some((e) => e.isDirectory)) {
		folders.push({name: DEFAULT_DECK_FOLDER, decks: defaultDecks})
	}

	// Find all subdirectories (deck folders)
	const subDirs = entries.filter((e) => e.isDirectory && e.fileName !== DEFAULT_DECK_FOLDER)
	subDirs.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime())

	for (const dir of subDirs) {
		const folderDecks = await _loadDecksFromFolder(dir.fileName)
		folders.unshift({name: dir.fileName, decks: folderDecks})
	}

	return folders
}

async function _loadDecksFromFolder(folderName: string): Promise<TDeckData[]> {
	const folderPath = `${DECK_PATH}${folderName}`
	const entries = await Files.readDir(folderPath)
	if (!entries) return []

	const ydkFiles = entries.filter((e) => !e.isDirectory && e.fileExtension === '.ydk')
	ydkFiles.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime())

	const decks: TDeckData[] = []
	for (const file of ydkFiles) {
		const deck = await getSavedDeck(`${file.fileName}${file.fileExtension}`, folderName)
		if (deck) decks.push(deck)
	}
	return decks
}

export async function createDeckFolder(folderName: string): Promise<boolean> {
	const safeName = folderName.replace(RUnsafePathCharactersRegex, '')
	const folderPath = `${DECK_PATH}${safeName}`
	const e = await Files.exists(folderPath)
	if (e.exists) return false
	return await Files.makeDir(folderPath)
}

export async function deleteDeckFolder(folderName: string): Promise<boolean> {
	if (folderName === DEFAULT_DECK_FOLDER) return false
	const folderPath = `${DECK_PATH}${folderName}`
	const e = await Files.exists(folderPath)
	if (!e.exists) return false
	return await Files.removeDir(folderPath)
}

export async function renameDeckFolder(oldName: string, newName: string): Promise<boolean> {
	if (oldName === DEFAULT_DECK_FOLDER) return false
	const safeNewName = newName.replace(RUnsafePathCharactersRegex, '')
	const oldPath = `${DECK_PATH}${oldName}`
	const newPath = `${DECK_PATH}${safeNewName}`
	if (oldPath === newPath) return true

	const e = await Files.exists(oldPath)
	if (!e.exists) return false

	return await Files.moveOrRename(oldPath, newPath)
}

// #endregion
// ----------------------------------------------------
// #region File Functions
// ----------------------------------------------------

/** @deprecated Use getSavedDeckFolders instead for folder support */
export async function getSavedDecks(): Promise<TDeckData[]> {
	const files = await Files.readDir(DECK_PATH)
	if (!files) return []
	const ydkFiles = files.filter((file) => file.fileExtension === '.ydk')
	ydkFiles.sort((a, b) => {
		const dateA = new Date(a.creationDate).getTime()
		const dateB = new Date(b.creationDate).getTime()
		return dateA - dateB
	})

	const decks: TDeckData[] = []
	for (const file of ydkFiles) {
		const deck = await getSavedDeck(`${file.fileName}${file.fileExtension}`)
		if (deck) decks.push(deck)
	}
	return decks
}

export async function getSavedDeck(fileName: string, folderName?: string) {
	const data = await loadDeckFile(fileName, folderName)
	if (!data) return null
	const deckJson = ydkToJsonIds(data)
	if (!deckJson) return null
	deckJson.name = fileName.endsWith('.ydk') ? fileName.slice(0, -4) : fileName
	return deckJson
}

async function loadDeckFile(fileName: string, folderName?: string) {
	const n = fileName.endsWith('.ydk') ? fileName : `${fileName}.ydk`
	const basePath =
		folderName && folderName !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${folderName}/` : DECK_PATH
	const e = await Files.exists(`${basePath}${n}`)
	if (!e.exists) return undefined

	const data = (await Files.readRaw(`${basePath}${n}`)) as string
	return data
}

export async function createDeckFile(deckName: string, deckData?: TDeckData, folderName?: string) {
	const n = deckName.endsWith('.ydk') ? deckName : `${deckName}.ydk`
	const basePath =
		folderName && folderName !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${folderName}/` : DECK_PATH

	// Ensure folder exists if specified
	if (folderName && folderName !== DEFAULT_DECK_FOLDER) {
		const folderExists = await Files.exists(`${DECK_PATH}${folderName}`)
		if (!folderExists.exists) {
			await Files.makeDir(`${DECK_PATH}${folderName}`)
		}
	}

	const e = await Files.exists(`${basePath}${n}`)
	if (e.exists) return null
	if (deckData) {
		const ydkData = jsonIdsToYdk(deckData)
		await Files.writeRaw(`${basePath}${n}`, ydkData)
		return deckData
	} else {
		await Files.writeRaw(`${basePath}${n}`, EMPTY_DECK_YDK)
		const newDeck: TDeckData = {
			name: deckName,
			comment: 'Created with YGO Tallymaster',
			main: [],
			extra: [],
			side: [],
		}
		return newDeck
	}
}

export async function saveDeckFile(deckData: TDeckData, folderName?: string) {
	const ydkData = jsonIdsToYdk(deckData)
	const fileName = deckData.name.endsWith('.ydk') ? deckData.name : `${deckData.name}.ydk`
	const basePath =
		folderName && folderName !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${folderName}/` : DECK_PATH
	return await Files.writeRaw(`${basePath}${fileName}`, ydkData)
}

export async function renameDeckFile(oldName: string, newName: string, folderName?: string) {
	const oldFileName = oldName.endsWith('.ydk') ? oldName : `${oldName}.ydk`
	const newFileName = newName.endsWith('.ydk') ? newName : `${newName}.ydk`
	if (oldFileName === newFileName) return true
	const basePath =
		folderName && folderName !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${folderName}/` : DECK_PATH
	const e = await Files.exists(`${basePath}${oldFileName}`)
	if (!e.exists) return false
	const success = await Files.moveOrRename(
		`${basePath}${oldFileName}`,
		`${basePath}${newFileName}`
	)
	return success
}

export async function moveDeckToFolder(
	deckName: string,
	oldFolder: string,
	newFolder: string
): Promise<boolean> {
	const fileName = deckName.endsWith('.ydk') ? deckName : `${deckName}.ydk`
	const oldBasePath =
		oldFolder && oldFolder !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${oldFolder}/` : DECK_PATH
	const newBasePath =
		newFolder && newFolder !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${newFolder}/` : DECK_PATH

	if (oldBasePath === newBasePath) return true

	// Ensure target folder exists
	if (newFolder && newFolder !== DEFAULT_DECK_FOLDER) {
		const folderExists = await Files.exists(`${DECK_PATH}${newFolder}`)
		if (!folderExists.exists) {
			await Files.makeDir(`${DECK_PATH}${newFolder}`)
		}
	}

	const e = await Files.exists(`${oldBasePath}${fileName}`)
	if (!e.exists) return false

	return await Files.moveOrRename(`${oldBasePath}${fileName}`, `${newBasePath}${fileName}`)
}

export async function deleteDeckFile(deckName: string, folderName?: string) {
	const n = deckName.endsWith('.ydk') ? deckName : `${deckName}.ydk`
	const basePath =
		folderName && folderName !== DEFAULT_DECK_FOLDER ? `${DECK_PATH}${folderName}/` : DECK_PATH
	const e = await Files.exists(`${basePath}${n}`)
	if (!e.exists) return
	await Files.remove(`${basePath}${n}`)
}
// #endregion
// ----------------------------------------------------
