import {fetchCardData, fetchDatabaseVersion, fetchCardSets} from './api/YGOProAPI'
import {getConfig, setConfig, _appIsUpToDate} from './Config'
import Files from './Files'
export async function appNeedsUpdating() {
	return await _appIsUpToDate()
}
export async function dbNeedsUpdating(): Promise<boolean> {
	const cfg = await getConfig()
	if (!cfg) return false
	if (cfg.dbVer === '0') return true
	const dbVer = await fetchDatabaseVersion()
	if (dbVer.database_version !== cfg.dbVer) return true
	return false
}

export async function performDBUpdate(
	onProgress?: (step: number, total: number, message: string) => void
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

	// Step 1: Fetch DB Version
	updateProgress('Fetching DB Version...')
	const dbVer = await fetchDatabaseVersion()

	// Step 2: Create necessary folders
	updateProgress('Creating necessary folders...')
	await createFolderStructure()

	// Step 3: Update Core Card Data
	updateProgress('Updating Core Card Data...')
	const coreData = await updateCoreCardData()
	if (!coreData) {
		hasError = true
		errorMsgs.push('Failed to update core card data.')
	}

	// Step 4: Update Staple Data
	updateProgress('Updating Staple Data...')
	const stapleData = await updateStapleData()
	if (!stapleData) {
		hasError = true
		errorMsgs.push('Failed to update staple data.')
	}

	// Step 5: Update Card Sets
	updateProgress('Updating Card Sets...')
	const cardSets = await updateCardSets()
	if (!cardSets) {
		hasError = true
		errorMsgs.push('Failed to update card sets.')
	}

	await setConfig({dbVer: dbVer.database_version})

	return {
		success: !hasError,
		errors: errorMsgs,
		totalSteps: TOTAL_STEPS,
		completedSteps: currentStep,
	}
}

async function updateCoreCardData() {
	const cardData = await fetchCardData('en')
	if (!cardData) return null
	await Files.write('data/carddata_en.json', cardData)
	return cardData.data.length
}

async function updateStapleData() {
	const cardData = await fetchCardData('en', ['&staple=yes'])
	if (!cardData) return null
	await Files.write('data/staples_en.json', cardData)
	return cardData.data.length
}

async function updateCardSets() {
	const cardSets = await fetchCardSets()
	if (!cardSets) return null
	await Files.write('data/sets_en.json', cardSets)
	return cardSets.length
}

async function createFolderStructure() {
	const folders = [
		'data',
		'userdata',
		'userdata/decks',
		'userdata/collections',
		'images',
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
