// src/composables/useCardOwnership.ts
import {ref, toRaw} from 'vue'
import type {IMarkedCards} from '@/libs/interfaces/CardSets'
import Files from '@/libs/Files'
import {useListSearch} from './useCardSearch'

const PATH = 'userdata/c_owned.json'
const SAVE_DEBOUNCE_MS = 1000

let listSearch = ref(null as null | ReturnType<typeof useListSearch>)
const initialized = ref(
	'uninitialized' as 'ready' | 'uninitialized' | 'loading'
)
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const ownedCards = ref<IMarkedCards | null>(null)

export const useOwnedCards = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init(force = false) {
		const e = await Files.exists(PATH)
		if (!e.exists) {
			ownedCards.value = {}
			await Files.write(PATH, {})
		} else {
			ownedCards.value = (await Files.read(PATH)) as IMarkedCards
			if (!ownedCards.value) {
				ownedCards.value = {}
			}
		}

		if (force && listSearch) {
			listSearch.value?.reinitializeIndex()
		} else {
			listSearch.value = useListSearch(ownedCards.value)
		}
		initialized.value = 'ready'
	}

	function save() {
		if (saveTimeout) {
			clearTimeout(saveTimeout)
		}
		saveTimeout = setTimeout(async () => {
			await Files.write(PATH, toRaw(ownedCards.value))
			saveTimeout = null
		}, SAVE_DEBOUNCE_MS)
	}

	// Get/Set helpers
	function getOwned(cardId: number): number {
		return ownedCards.value?.[cardId] ?? 0
	}

	function setOwned(cardId: number, count: number) {
		if (!ownedCards.value) return 0
		const oldVal = getOwned(cardId)
		if (!ownedCards.value[cardId]) {
			ownedCards.value[cardId] = 0
		}
		ownedCards.value[cardId] = Math.max(0, count)
		if (count > 0 && oldVal === 0) {
			listSearch.value?.indexCard(cardId)
		} else if (count === 0 && oldVal > 0) {
			listSearch.value?.deindexCard(cardId)
		}

		_cleanup(cardId)
		save()
	}

	// Increment/Decrement shortcuts
	const incrementOwned = (cardId: number) =>
		setOwned(cardId, getOwned(cardId) + 1)
	const decrementOwned = (cardId: number) =>
		setOwned(cardId, getOwned(cardId) - 1)

	// Remove entry if both are 0 (keeps file clean)
	function _cleanup(cardId: number) {
		const entry = ownedCards.value?.[cardId]
		if (entry != undefined && entry <= 0) {
			delete ownedCards.value![cardId]
		}
	}

	function reinitializeMarkedCards() {
		initialized.value = 'uninitialized'
		listSearch.value = null
		ownedCards.value = {}
		_init(true)
	}

	return {
		ownedCards,
		save,
		getOwned,
		setOwned,
		incrementOwned,
		decrementOwned,
		reinitializeMarkedCards,
		initialized,
		cardList: listSearch,
	}
}
