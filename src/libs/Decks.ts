import Files from './Files'
const DECK_PATH = 'userdata/decks/'

// ----------------------------------------------------
// #region YDK Parsing and Types
// ----------------------------------------------------

function _ydkToJson(ydkData: string): TDeckData | null {
	const lines = ydkData.split('\n').map((line) => line.trim())
	const deckData: TDeckData = {
		name: '',
		main: [],
		extra: [],
		side: [],
	}

	let currentSection: 'main' | 'extra' | 'side' | null = null
	for (const line of lines) {
		if (line === '#main') {
			currentSection = 'main'
		} else if (line === '#extra') {
			currentSection = 'extra'
		} else if (line === '!side') {
			currentSection = 'side'
		} else if (line.startsWith('#')) {
			currentSection = null
			deckData.comment = line.substring(1).trim()
		} else if (currentSection) {
			const cardId = parseInt(line, 10)
			if (!isNaN(cardId)) {
				deckData[currentSection].push(cardId)
			}
		}
	}
	return deckData
}

function _jsonToYdk(deckData: TDeckData): string {
	let ydkData = `${
		deckData.comment ? `#${deckData.comment}\n` : '#Created with YGO Tallymaster\n'
	}`
	ydkData += '#main\n'
	deckData.main.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	ydkData += '#extra\n'
	deckData.extra.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	ydkData += '!side\n'
	deckData.side.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	return ydkData
}

export type TDeckData = {
	name: string
	comment?: string
	main: Array<number>
	extra: Array<number>
	side: Array<number>
}

// #endregion
// ----------------------------------------------------
// #region Functions
// ----------------------------------------------------

export async function getSavedDecks(): Promise<TDeckData[]> {
	const files = await Files.readDir(DECK_PATH, 'asc')
	if (!files) return []

	const decks: TDeckData[] = []
	for (const file of files) {
		if (!file.endsWith('.ydk')) continue
		const deck = await getSavedDeck(file)
		if (deck) decks.push(deck)
	}
	return decks
}

export async function getSavedDeck(fileName: string) {
	const data = await loadDeckFile(fileName)
	if (!data) return null
	const deckJson = _ydkToJson(data)
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
		const ydkData = _jsonToYdk(deckData)
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
	const ydkData = _jsonToYdk(deckData)
	const fileName = deckData.name.endsWith('.ydk') ? deckData.name : `${deckData.name}.ydk`
	await Files.writeRaw(`${DECK_PATH}${fileName}`, ydkData)
}
// #endregion
// ----------------------------------------------------

const EMPTY_DECK_YDK = `
#Created with YGO Tallymaster
#main
#extra
!side
`
