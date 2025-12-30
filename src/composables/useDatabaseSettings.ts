import {ref, toRaw} from 'vue'
import Files from '@/libs/Files'

const SAVE_DEBOUNCE_MS = 1000
const PATH = 'userdata/db_settings.json'
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const settings = ref<TDatabaseSettings | null>(null)
const initialized = ref(
	'uninitialized' as 'ready' | 'uninitialized' | 'loading'
)

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
	function listSize(to: TSizes) {
		if (!settings.value) return
		settings.value.listSize = to
		save()
	}

	const toggleFns = {
		displayAsList,
		showOwnedNumbers,
		grayUnowned,
	}
	const setFns = {
		listSize,
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
}
// Default settings
const DEFAULT_DATABASE_SETTINGS: Readonly<TDatabaseSettings> = {
	displayAsList: false,
	showOwnedNumbers: false,
	grayUnowned: false,
	listSize: 'small',
}
