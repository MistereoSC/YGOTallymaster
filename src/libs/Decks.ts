import {jsonIdsToYdk, ydkToJsonIds} from './DeckParsers'
import Files from './Files'
import {TCardData} from './interfaces/YGOProInterfaces'
const DECK_PATH = 'userdata/decks/'

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

const EMPTY_DECK_YDK = `
#Created with YGO Tallymaster
#main
#extra
!side
`

// #endregion
// ----------------------------------------------------
// #region File Functions
// ----------------------------------------------------

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

export async function getSavedDeck(fileName: string) {
	const data = await loadDeckFile(fileName)
	if (!data) return null
	const deckJson = ydkToJsonIds(data)
	if (!deckJson) return null
	deckJson.name = fileName.endsWith('.ydk') ? fileName.slice(0, -4) : fileName
	return deckJson
}

async function loadDeckFile(fileName: string) {
	const n = fileName.endsWith('.ydk') ? fileName : `${fileName}.ydk`
	const e = await Files.exists(`${DECK_PATH}${n}`)
	if (!e.exists) return undefined

	const data = (await Files.readRaw(`${DECK_PATH}${n}`)) as string
	return data
}

export async function createDeckFile(deckName: string, deckData?: TDeckData) {
	const n = deckName.endsWith('.ydk') ? deckName : `${deckName}.ydk`
	const e = await Files.exists(`${DECK_PATH}${n}`)
	if (e.exists) return null
	if (deckData) {
		const ydkData = jsonIdsToYdk(deckData)
		await Files.writeRaw(`${DECK_PATH}${n}`, ydkData)
		return deckData
	} else {
		await Files.writeRaw(`${DECK_PATH}${n}`, EMPTY_DECK_YDK)
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
export async function saveDeckFile(deckData: TDeckData) {
	const ydkData = jsonIdsToYdk(deckData)
	const fileName = deckData.name.endsWith('.ydk') ? deckData.name : `${deckData.name}.ydk`
	return await Files.writeRaw(`${DECK_PATH}${fileName}`, ydkData)
}

export async function renameDeckFile(oldName: string, newName: string) {
	const oldFileName = oldName.endsWith('.ydk') ? oldName : `${oldName}.ydk`
	const newFileName = newName.endsWith('.ydk') ? newName : `${newName}.ydk`
	if (oldFileName === newFileName) return true
	const e = await Files.exists(`${DECK_PATH}${oldFileName}`)
	if (!e.exists) return false
	const success = await Files.moveOrRename(
		`${DECK_PATH}${oldFileName}`,
		`${DECK_PATH}${newFileName}`
	)
	return success
}

export async function deleteDeckFile(deckName: string) {
	const n = deckName.endsWith('.ydk') ? deckName : `${deckName}.ydk`
	const e = await Files.exists(`${DECK_PATH}${n}`)
	if (!e.exists) return
	await Files.remove(`${DECK_PATH}${n}`)
}
// #endregion
// ----------------------------------------------------
