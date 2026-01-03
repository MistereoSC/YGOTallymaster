import {ref, toRaw} from 'vue'
import Files from '@/libs/Files'
import {TBanlistFormat} from '@/libs/interfaces/YGOProInterfaces'

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
		initialized.value = 'ready'
		const e = await Files.exists(PATH)
		if (!e.exists) {
			settings.value = {...DEFAULT_DATABASE_SETTINGS}
			await save()
		} else {
			settings.value = (await Files.read(PATH)) as TDatabaseSettings
			if (!settings.value) {
				settings.value = {...DEFAULT_DATABASE_SETTINGS}
			}
		}
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

	function displayAsList(to?: boolean) {
		if (!settings.value) return
		settings.value.displayAsList = to ?? !settings.value.displayAsList
		save()
	}
	function showOwnedNumbers(to?: boolean) {
		if (!settings.value) return
		settings.value.showOwnedNumbers = to ?? !settings.value.showOwnedNumbers
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
	function decklistGrayUnownedList(to?: boolean) {
		if (!settings.value) return
		settings.value.decklistGrayUnownedList = to ?? !settings.value.decklistGrayUnownedList
		save()
	}
	function decklistShowOwnedHeartList(to?: boolean) {
		if (!settings.value) return
		settings.value.decklistShowOwnedHeartList = to ?? !settings.value.decklistShowOwnedHeartList
		save()
	}

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
	function decklistListSize(to: TSizes) {
		if (!settings.value) return
		settings.value.decklistListSize = to
		save()
	}
	function showBanlistFor(to: TBanlistFormat | 'none') {
		if (!settings.value) return
		settings.value.showBanlistFor = to
		save()
	}

	const toggleFns = {
		displayAsList,
		showOwnedNumbers,
		grayUnowned,
		decklistGrayUnownedGrid,
		decklistGrayUnownedList,
		decklistShowOwnedHeartList,
	}
	const setFns = {
		listSize,
		decklistGridSize,
		decklistListSize,
		showBanlistFor,
	}

	return {
		settings,
		initialized,
		toggle: toggleFns,
		set: setFns,
	}
}

type TSizes = 'tiny' | 'small' | 'medium' | 'large'
export type TDatabaseSettings = {
	displayAsList: boolean
	showOwnedNumbers: boolean
	grayUnowned: boolean
	listSize: TSizes
	showBanlistFor?: TBanlistFormat | 'none'

	decklistGrayUnownedGrid: boolean
	decklistGrayUnownedList: boolean
	decklistShowOwnedHeartList: boolean
	decklistGridCardSize: TSizes
	decklistListSize: TSizes
}
// Default settings
const DEFAULT_DATABASE_SETTINGS: Readonly<TDatabaseSettings> = {
	displayAsList: false,
	showOwnedNumbers: false,
	grayUnowned: false,
	listSize: 'small',
	showBanlistFor: 'ban_tcg',

	decklistGrayUnownedGrid: false,
	decklistGrayUnownedList: false,
	decklistShowOwnedHeartList: false,
	decklistGridCardSize: 'tiny',
	decklistListSize: 'tiny',
}
