import {ref, toRaw} from 'vue'
import Files from '@/libs/Files'
import {TBanlistFormat} from '@/libs/interfaces/YGOProInterfaces'
import {TLanguageCodes} from '@/libs/interfaces/Localization'
import {TVendor} from '@/libs/interfaces/CardSets'

const SAVE_DEBOUNCE_MS = 1000
const PATH = 'userdata/db_settings.json'
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const settings = ref<TDatabaseSettings | null>(null)
const initialized = ref('uninitialized' as 'ready' | 'uninitialized' | 'loading')

export const useDatabaseSettings = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init() {
		await getSettings()
		await save()
		initialized.value = 'ready'
	}
	async function save() {
		await Files.write(PATH, settings.value)
		if (saveTimeout) {
			clearTimeout(saveTimeout)
		}
		saveTimeout = setTimeout(async () => {
			await Files.write(PATH, toRaw(settings.value))
			saveTimeout = null
		}, SAVE_DEBOUNCE_MS)
	}

	// ------------------------------------------------------------
	// #region Toggle functions
	// ------------------------------------------------------------

	function displayAsList(to?: boolean) {
		if (!settings.value) return
		settings.value.displayAsList = to ?? !settings.value.displayAsList
		save()
	}
	function grayUnowned(to?: boolean) {
		if (!settings.value) return
		settings.value.grayUnowned = to ?? !settings.value.grayUnowned
		save()
	}
	function decklistGrayUnownedGrid(to?: boolean) {
		if (!settings.value) return
		settings.value.decklistGrayUnownedGrid = to ?? !settings.value.decklistGrayUnownedGrid
		save()
	}
	function setsGrayUnownedGrid(to?: boolean) {
		if (!settings.value) return
		settings.value.setsGrayUnownedGrid = to ?? !settings.value.setsGrayUnownedGrid
		save()
	}
	function setsDisplayAsList(to?: boolean) {
		if (!settings.value) return
		settings.value.setsDisplayAsList = to ?? !settings.value.setsDisplayAsList
		save()
	}
	function grayUnownedSmallList(to?: boolean) {
		if (!settings.value) return
		settings.value.grayUnownedSmallList = to ?? !settings.value.grayUnownedSmallList
		save()
	}
	function descriptionHighlighting(to?: boolean) {
		if (!settings.value) return
		settings.value.descriptionHighlighting = to ?? !settings.value.descriptionHighlighting
		save()
	}
	function englishNameSearch(to?: boolean) {
		if (!settings.value) return
		settings.value.englishNameSearch = to ?? !settings.value.englishNameSearch
		save()
	}
	function splitDatabaseView(to?: boolean) {
		if (!settings.value) return
		settings.value.splitDatabaseView = to ?? !settings.value.splitDatabaseView
		save()
	}
	function setsGrayUnownedGridReverse(to?: boolean) {
		if (!settings.value) return
		settings.value.setsGrayUnownedGridReverse = to ?? !settings.value.setsGrayUnownedGridReverse
		save()
	}
	function setsShowOwnedHeart(to?: boolean) {
		if (!settings.value) return
		settings.value.setsShowOwnedHeart = to ?? !settings.value.setsShowOwnedHeart
		save()
	}
	function displayMDRarity(to?: boolean) {
		if (!settings.value) return
		settings.value.displayMDRarity = to ?? !settings.value.displayMDRarity
		save()
	}
	function showDescriptionReleases(to?: boolean) {
		if (!settings.value) return
		settings.value.showDescriptionReleases = to ?? !settings.value.showDescriptionReleases
		save()
	}
	function showStaplesSlider(to?: boolean) {
		if (!settings.value) return
		settings.value.showStaplesSlider = to ?? !settings.value.showStaplesSlider
		save()
	}

	// #endregion
	// ------------------------------------------------------------
	// #region Select functions
	// ------------------------------------------------------------

	function listSize(to: TSizes) {
		if (!settings.value) return
		settings.value.listSize = to
		save()
	}
	function decklistGridSize(to: TSizes) {
		if (!settings.value) return
		settings.value.decklistGridCardSize = to
		save()
	}
	function showBanlistFor(to: TBanlistFormat | 'none') {
		if (!settings.value) return
		settings.value.showBanlistFor = to
		save()
	}
	function gridSize(to: TSizes) {
		if (!settings.value) return
		settings.value.gridSize = to
		save()
	}
	function listSizeSmallList(to: TSizes) {
		if (!settings.value) return
		settings.value.listSizeSmallList = to
		save()
	}
	function cardLanguage(to: TLanguageCodes) {
		if (!settings.value) return
		settings.value.cardLanguage = to
		save()
	}
	function cardPricesVendor(to: TVendor) {
		if (!settings.value) return
		settings.value.cardPricesVendor = to
		save()
	}

	// #endregion
	// ------------------------------------------------------------
	// #region Returns
	// ------------------------------------------------------------

	const toggleFns = {
		displayAsList,
		grayUnowned,
		decklistGrayUnownedGrid,
		setsGrayUnownedGrid,
		grayUnownedSmallList,
		setsDisplayAsList,
		descriptionHighlighting,
		englishNameSearch,
		splitDatabaseView,
		setsGrayUnownedGridReverse,
		setsShowOwnedHeart,
		displayMDRarity,
		showDescriptionReleases,
		showStaplesSlider,
	}
	const setFns = {
		listSize,
		decklistGridSize,
		showBanlistFor,
		listSizeSmallList,
		cardLanguage,
		gridSize,
		cardPricesVendor,
	}

	return {
		settings,
		initialized,
		toggle: toggleFns,
		set: setFns,
	}

	// #endregion
	// ------------------------------------------------------------
}

export async function getSettings() {
	if (settings.value) return settings.value

	const e = await Files.exists(PATH)
	if (!e.exists) {
		settings.value = {...DEFAULT_DATABASE_SETTINGS}
	} else {
		settings.value = (await Files.read(PATH)) as TDatabaseSettings
		if (!settings.value) {
			settings.value = {...DEFAULT_DATABASE_SETTINGS}
		}
		// Add all settings missing from the DEFAULT_DATABASE_SETTINGS
		for (const key in DEFAULT_DATABASE_SETTINGS) {
			if (!(key in settings.value)) {
				;(settings.value as any)[key] = (DEFAULT_DATABASE_SETTINGS as any)[key]
			}
		}
	}
	return settings.value
}

type TSizes = 'tiny' | 'small' | 'medium' | 'large'
export type TDatabaseSettings = {
	showBanlistFor: TBanlistFormat | 'none'
	listSizeSmallList: TSizes
	grayUnownedSmallList: boolean

	displayAsList: boolean
	grayUnowned: boolean
	listSize: TSizes
	gridSize: TSizes

	decklistGrayUnownedGrid: boolean
	decklistGridCardSize: TSizes
	setsGrayUnownedGrid: boolean
	setsGrayUnownedGridReverse: boolean
	setsDisplayAsList: boolean
	setsShowOwnedHeart: boolean
	showStaplesSlider: boolean

	cardLanguage: TLanguageCodes
	descriptionHighlighting: boolean
	showDescriptionReleases: boolean
	englishNameSearch: boolean
	cardPricesVendor: TVendor
	splitDatabaseView: boolean
	displayMDRarity: boolean
}
// Default settings
const DEFAULT_DATABASE_SETTINGS: Readonly<TDatabaseSettings> = {
	showBanlistFor: 'ban_tcg',
	listSizeSmallList: 'tiny',
	grayUnownedSmallList: false,

	displayAsList: false,
	grayUnowned: false,
	listSize: 'small',
	gridSize: 'small',

	decklistGrayUnownedGrid: false,
	decklistGridCardSize: 'tiny',
	setsGrayUnownedGrid: false,
	setsGrayUnownedGridReverse: false,
	setsDisplayAsList: false,
	setsShowOwnedHeart: true,
	showStaplesSlider: false,

	cardLanguage: 'en',
	descriptionHighlighting: true,
	showDescriptionReleases: true,
	englishNameSearch: false,
	cardPricesVendor: 'none',
	splitDatabaseView: false,
	displayMDRarity: false,
}
