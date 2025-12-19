import {fetchCardData, fetchDatabaseVersion} from './api/YGOProAPI'
import {getConfig, setConfig, APP_VER} from './Config'
import Files from './Files'
export async function appNeedsUpdating(): Promise<boolean> {
	const cfg = await getConfig()
	if (!cfg) return false
	if (cfg.appVer !== APP_VER) return true
	return false
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
	let hasError = false
	let errorMsgs: string[] = []
	const totalSteps = 2 // Update this when adding more steps
	let currentStep = 0

	const updateProgress = (message: string) => {
		currentStep++
		console.debug(`UPDATE::: Step ${currentStep}/${totalSteps}: ${message}`)
		if (onProgress) {
			onProgress(currentStep, totalSteps, message)
		}
	}

	// Step 1: Fetch DB Version
	updateProgress('Fetching DB Version...')
	const dbVer = await fetchDatabaseVersion()

	// Step 2: Update Core Card Data
	updateProgress('Updating Core Card Data...')
	const l = await updateCoreCardData()
	if (!l) {
		hasError = true
		errorMsgs.push('Failed to update core card data.')
	}

	await setConfig({dbVer: dbVer.database_version})

	return {
		success: !hasError,
		errors: errorMsgs,
		totalSteps,
		completedSteps: currentStep,
	}
}

async function updateCoreCardData() {
	const cardData = await fetchCardData('en')
	if (!cardData) return null
	await Files.write('data/carddata_en.json', cardData)
	return cardData.data.length
}
