import {fetchCardData, fetchCardSets, fetchDatabaseVersion} from './api/YGOProAPI'
import {getConfig, setConfig, _appIsUpToDate} from './Config'
import Files from './Files'
import {TLanguageCodes} from './interfaces/Localization'
export async function appNeedsUpdating() {
	return await _appIsUpToDate()
}
export async function dbNeedsUpdating(language: TLanguageCodes): Promise<boolean> {
	const cfg = await getConfig()
	if (!cfg) return false
	const dbVersionLang = cfg.dbVer[language]
	if (!dbVersionLang || dbVersionLang === '0') return true
	const dbVer = await fetchDatabaseVersion()
	if (dbVer.database_version !== dbVersionLang) return true
	return false
}

export async function performDBUpdate(
	onProgress?: (step: number, total: number, message: string) => void,
	lang: TLanguageCodes = 'en'
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
	const dbConfigVer = cfg.dbVer
	dbConfigVer[lang] = dbVer.database_version

	// Step 3: Create necessary folders
	updateProgress('Creating necessary folders...')
	await createFolderStructure()

	// Step 4: Update Core Card Data
	updateProgress('Updating Core Card Data...')
	const coreData = await updateCoreCardData(lang)
	if (!coreData) {
		hasError = true
		errorMsgs.push('Failed to update core card data.')
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

	await setConfig({dbVer: dbConfigVer})

	return {
		success: !hasError,
		errors: errorMsgs,
		totalSteps: TOTAL_STEPS,
		completedSteps: currentStep,
	}
}

async function updateCoreCardData(language: TLanguageCodes = 'en') {
	const cardData = await fetchCardData(language)
	if (!cardData) return null
	await Files.write(`data/carddata_${language}.json`, cardData)
	return cardData.data.length
}

async function updateCardSets() {
	const cardSets = await fetchCardSets()
	if (!cardSets) return null
	await Files.write('data/sets_en.json', cardSets)
	return cardSets.length
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
			}
			await setConfig({dbVer: newDbVer})
		} else if (typeof cfg.dbVer === 'string') {
			const newDbVer = {
				en: cfg.dbVer,
				de: '0',
				fr: '0',
				it: '0',
				pt: '0',
			}
			await setConfig({dbVer: newDbVer})
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
