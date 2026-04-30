import {fetchCardData, fetchCardSets, fetchDatabaseVersion} from './api/YGOProAPI'
import {fetchCardDataFromYGOCDB} from './api/YGOCDBAPI'
import {getConfig, setConfig, _appIsUpToDate} from './Config'
import Files from './Files'
import {TLanguageCodes} from './interfaces/Localization'
import {TCardData} from './interfaces/YGOProInterfaces'
import {TYGOCDBCardsById} from './interfaces/YGOCDBInterfaces'

const SUPPORTED_LANGUAGES: readonly TLanguageCodes[] = ['en', 'de', 'fr', 'it', 'pt', 'zh', 'ja']
const YGOPRODECK_LANGUAGES: readonly TLanguageCodes[] = ['en', 'de', 'fr', 'it', 'pt']

export async function appNeedsUpdating() {
	return await _appIsUpToDate()
}

export async function dbNeedsUpdating(_language: TLanguageCodes): Promise<boolean> {
	const status = await getDBUpdateStatus()
	return status.needsUpdate
}

export async function getDBUpdateStatus(): Promise<{
	needsUpdate: boolean
	remoteVersionChanged: boolean
	cardDataFileMissing: boolean
}> {
	const missingLanguages = await getMissingCardDataLanguages()
	if (missingLanguages.length > 0) {
		return {
			needsUpdate: true,
			remoteVersionChanged: false,
			cardDataFileMissing: true,
		}
	}

	const cfg = await getConfig()
	if (!cfg) {
		return {
			needsUpdate: true,
			remoteVersionChanged: true,
			cardDataFileMissing: false,
		}
	}

	const hasMissingVersion = SUPPORTED_LANGUAGES.some((language) => {
		const dbVersionLang = cfg.dbVer[language]
		return !dbVersionLang || dbVersionLang === '0'
	})
	if (hasMissingVersion) {
		return {
			needsUpdate: true,
			remoteVersionChanged: true,
			cardDataFileMissing: false,
		}
	}

	const dbVer = await fetchDatabaseVersion()
	const remoteVersionChanged = SUPPORTED_LANGUAGES.some(
		(language) => cfg.dbVer[language] !== dbVer.database_version
	)
	return {
		needsUpdate: remoteVersionChanged,
		remoteVersionChanged,
		cardDataFileMissing: false,
	}
}

export async function performDBUpdate(
	onProgress?: (step: number, total: number, message: string) => void,
	_lang: TLanguageCodes = 'en'
) {
	const TOTAL_STEPS: Readonly<number> = 5
	let hasError = false
	let errorMsgs: string[] = []
	let currentStep = 0

	const updateProgress = (message: string) => {
		currentStep++
		console.debug(`UPDATE::: Step ${currentStep}/${TOTAL_STEPS}: ${message}`)
		if (onProgress) {
			onProgress(currentStep, TOTAL_STEPS, message)
		}
	}

	const cfg = await getConfig()
	if (!cfg) {
		throw new Error('Failed to load config for update')
	}
	
	// Step 1: Run Version Migrations if needed
	updateProgress('Running version migrations...')
	await runVersionMigrations()

	// Step 2: Fetch DB Version
	updateProgress('Fetching DB Version...')
	const dbVer = await fetchDatabaseVersion()
	const dbConfigVer = {...cfg.dbVer}

	updateProgress('Creating necessary folders...')
	await createFolderStructure()

	// Step 3: Create necessary folders
	updateProgress('Fetching card data for all languages...')
	const ygoprodeckCardsByLanguage = await fetchYGOProDeckCardsByLanguage()
	const ygocdbCardsById = await fetchCardDataFromYGOCDB()

	// Step 4: Update Core Card Data
	updateProgress('Generating localized card data files...')
	const cardsUpdated = await updateAllCardDataFiles(ygoprodeckCardsByLanguage, ygocdbCardsById)
	if (!cardsUpdated) {
		hasError = true
		errorMsgs.push('Failed to update card data files.')
	}

	// Step 5: Update Card Sets
	updateProgress('Updating Card Sets...')
	const cardSets = await updateCardSets()
	if (!cardSets) {
		hasError = true
		errorMsgs.push('Failed to update card sets.')
	}

	// Step 6: Update Staple Data
	// updateProgress('Updating Staple Data...')
	// const stapleData = await updateStapleData()
	// if (!stapleData) {
	// 	hasError = true
	// 	errorMsgs.push('Failed to update staple data.')
	// }

	if (!hasError) {
		for (const language of SUPPORTED_LANGUAGES) {
			dbConfigVer[language] = dbVer.database_version
		}
	}
	await setConfig({dbVer: dbConfigVer})

	return {
		success: !hasError,
		errors: errorMsgs,
		totalSteps: TOTAL_STEPS,
		completedSteps: currentStep,
	}
}

async function fetchYGOProDeckCardsByLanguage(): Promise<Record<TLanguageCodes, TCardData[]>> {
	const cardDataByLanguage = {} as Record<TLanguageCodes, TCardData[]>
	const responses = await Promise.all(
		YGOPRODECK_LANGUAGES.map(async (language) => {
			const response = await fetchCardData(language)
			return {language, cards: response.data}
		})
	)

	for (const response of responses) {
		cardDataByLanguage[response.language] = response.cards
	}

	const englishCards = cardDataByLanguage.en
	cardDataByLanguage.zh = englishCards
	cardDataByLanguage.ja = englishCards
	return cardDataByLanguage
}

async function updateAllCardDataFiles(
	cardsByLanguage: Record<TLanguageCodes, TCardData[]>,
	ygocdbCardsById: TYGOCDBCardsById
): Promise<number | null> {
	const englishCards = cardsByLanguage.en
	if (!englishCards || englishCards.length === 0) return null

	const englishNamesById = buildCardNameMap(englishCards)
	const searchAliasesById = buildSearchAliasesById(cardsByLanguage, ygocdbCardsById)

	for (const language of SUPPORTED_LANGUAGES) {
		const sourceCards = cardsByLanguage[language]
		if (!sourceCards) return null
		const requiresYGOCDBCard = language === 'zh' || language === 'ja'
		const outputCards = requiresYGOCDBCard
			? sourceCards.filter((card) => !!resolveYGOCDBCard(card, ygocdbCardsById))
			: sourceCards

		const cardData = outputCards.map((card) => {
			const ygocdbCard = resolveYGOCDBCard(card, ygocdbCardsById)
			const englishName = englishNamesById.get(card.id) || card.name
			const aliases = searchAliasesById.get(card.id) || []

			let displayName = card.name
			let description = card.desc

			if (language === 'zh') {
				displayName = ygocdbCard?.zhName || card.name
				description = ygocdbCard?.zhDescription || card.desc
			} else if (language === 'ja') {
				displayName = ygocdbCard?.jaName || card.name
				description = card.desc
			}

			return {
				...card,
				name: displayName,
				desc: description,
				name_en: englishName,
				searchAliases: aliases,
				misc_info: card.misc_info.map((info, index) =>
					index === 0 ? {...info, name_en: info.name_en || englishName} : info
				),
			}
		})

		const writeSuccess = await Files.write(getCardDataFilePath(language), {data: cardData})
		if (!writeSuccess) return null
	}

	await removeLegacyYGOCDBOverlayFile()
	return englishCards.length
}

function buildCardNameMap(cards: TCardData[]): Map<number, string> {
	const out = new Map<number, string>()
	for (const card of cards) {
	out.set(card.id, card.name)
	}
	return out
}

function resolveYGOCDBCard(
	card: TCardData,
	ygocdbCardsById: TYGOCDBCardsById
): TYGOCDBCardsById[number] | undefined {
	return ygocdbCardsById[card.id]
}

function buildSearchAliasesById(
	cardsByLanguage: Record<TLanguageCodes, TCardData[]>,
	ygocdbCardsById: TYGOCDBCardsById
): Map<number, string[]> {
	const aliasesById = new Map<number, Set<string>>()

	const addAlias = (id: number, value?: string) => {
		const normalized = value?.trim()
		if (!normalized) return
		if (!aliasesById.has(id)) aliasesById.set(id, new Set<string>())
		aliasesById.get(id)!.add(normalized)
	}

	for (const language of YGOPRODECK_LANGUAGES) {
		for (const card of cardsByLanguage[language] || []) {
			addAlias(card.id, card.name)
		}
	}

	for (const ygocdbCard of Object.values(ygocdbCardsById)) {
		addAlias(ygocdbCard.id, ygocdbCard.zhName)
		addAlias(ygocdbCard.id, ygocdbCard.jaName)
		for (const name of ygocdbCard.zhSearchNames) addAlias(ygocdbCard.id, name)
		for (const name of ygocdbCard.jaSearchNames) addAlias(ygocdbCard.id, name)
	}

	const out = new Map<number, string[]>()
	for (const [id, names] of aliasesById.entries()) {
		out.set(id, Array.from(names))
	}
	return out
}

async function removeLegacyYGOCDBOverlayFile() {
	const legacyFilePath = 'data/ygocdb_cards.json'
	if ((await Files.exists(legacyFilePath)).exists) {
		await Files.remove(legacyFilePath)
	}
}

async function updateCardSets() {
	const cardSets = await fetchCardSets()
	if (!cardSets) return null
	const writeSuccess = await Files.write('data/sets_en.json', cardSets)
	if (!writeSuccess) return null
	return cardSets.length
}

export function getCardDataFilePath(language: TLanguageCodes) {
	return `data/carddata_${language}.json`
}

export async function cardDataFileExists(language: TLanguageCodes): Promise<boolean> {
	return (await Files.exists(getCardDataFilePath(language))).exists
}

export async function getMissingCardDataLanguages(): Promise<TLanguageCodes[]> {
	const missing: TLanguageCodes[] = []
	for (const language of SUPPORTED_LANGUAGES) {
		if (!(await cardDataFileExists(language))) missing.push(language)
	}
	return missing
}

// async function updateStapleData() {
// 	const cardData = await fetchCardData('en', ['&staple=yes'])
// 	if (!cardData) return null
// 	await Files.write('data/staples_en.json', cardData)
// 	return cardData.data.length
// }

async function createFolderStructure() {
	const folders = [
		'data',
		'userdata',
		'userdata/decks',
		'userdata/collections',
		'images',
		'images/sets',
		'images/cards',
		'images/cards/cropped',
		'images/cards/small',
	]
	for (const folder of folders) {
		const e = await Files.exists(folder)
		if (!e.exists) {
			await Files.makeDir(folder)
		}
	}
}

// -------------------------------------------------------------
// #region Version Migration
// -------------------------------------------------------------
function versionIsLessThan(v1: string, v2: string): boolean {
	const v1Parts = v1.split('.').map(Number)
	const v2Parts = v2.split('.').map(Number)
	for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
		const part1 = v1Parts[i] || 0
		const part2 = v2Parts[i] || 0
		if (part1 < part2) return true
		if (part1 > part2) return false
	}
	return false
}

export async function runVersionMigrations() {
	const cfg = await getConfig()
	const oldVer = cfg?.oldVer || '0'

	if (versionIsLessThan(oldVer, '1.2.0')) {
		if (!cfg) throw new Error('Failed to load config for migration')
		// Migrate dbVer from string to object
		if (!cfg.dbVer) {
			const newDbVer = {
				en: '0',
				de: '0',
				fr: '0',
				it: '0',
				pt: '0',
				zh: '0',
				ja: '0',
			}
			await setConfig({dbVer: newDbVer})
		} else if (typeof cfg.dbVer === 'string') {
			const newDbVer = {
				en: cfg.dbVer,
				de: '0',
				fr: '0',
				it: '0',
				pt: '0',
				zh: '0',
				ja: '0',
			}
			await setConfig({dbVer: newDbVer})
		}
	}
	if (versionIsLessThan(oldVer, '1.5.6')) {
		const cfgNewest = await getConfig()
		if (cfgNewest?.dbVer) {
			await setConfig({
				dbVer: {
					...cfgNewest.dbVer,
					zh: cfgNewest.dbVer.zh || '0',
					ja: cfgNewest.dbVer.ja || '0',
				},
			})
		}
	}
	if (versionIsLessThan(oldVer, '1.4.0')) {
		await updateCardSets()
		const e = await Files.exists('images/sets')
		if (!e.exists) {
			await Files.makeDir('images/sets')
		}
	}

	await setConfig({}) // Just to update the appVer and remove oldVer
}
