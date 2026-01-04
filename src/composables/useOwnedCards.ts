// src/composables/useCardOwnership.ts
import {ref, toRaw, markRaw} from 'vue'
import type {IMarkedCards} from '@/libs/interfaces/CardSets'
import Files from '@/libs/Files'
import {
	_createMinisearchIndex,
	_searchQueryIsEmpty,
	_sort,
	_find,
	ESortBy,
	getFullCardList,
	TSearchQuery,
	TSearchResultCardData,
} from './useCardSearch'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import MiniSearch from 'minisearch'

const PATH = 'userdata/c_owned.json'
const SAVE_DEBOUNCE_MS = 1000
const MIN_SCORE_THRESHOLD: Readonly<number> = 2
let saveTimeout: ReturnType<typeof setTimeout> | null = null

let miniSearchIndex = null as null | MiniSearch<TCardData>
const initialized = ref('uninitialized' as 'ready' | 'uninitialized' | 'loading')
const searchResults = ref(null as TCardData[] | null)
const activeQuery = ref<TSearchQuery>({})
const ownedCardList = ref([] as TCardData[])
const sortedBy = ref(ESortBy.Name_Asc)

const ownedCards = ref<IMarkedCards | null>(null)
const useOwnedCards = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init() {
		const cardData = await getFullCardList()
		await _readOwnedCards()

		ownedCardList.value = cardData.filter(
			(card) => ownedCards.value && ownedCards.value[card.id] && ownedCards.value[card.id] > 0
		)
		miniSearchIndex = _createMinisearchIndex(ownedCardList.value)

		activeQuery.value = {}
		searchResults.value = null
		sortedBy.value = ESortBy.Name_Asc

		initialized.value = 'ready'
	}

	function sort(by?: ESortBy) {
		if (!by && sortedBy.value === ESortBy.Name_Asc) return
		else if (by === sortedBy.value) return
		sortedBy.value = by ?? ESortBy.Name_Asc

		ownedCardList.value = _sort(by ?? ESortBy.Name_Asc, ownedCardList.value)
		if (searchResults.value) {
			searchResults.value = markRaw(_sort(by ?? ESortBy.Name_Asc, [...searchResults.value]))
		}
	}

	function search(query: TSearchQuery) {
		if (!miniSearchIndex) return []
		activeQuery.value = query
		if (_searchQueryIsEmpty(query)) {
			searchResults.value = null
			return []
		}

		let cOut = ownedCardList.value

		if (query.term && query.term.length > 0) {
			cOut = _searchTerm(query.term)
			if (sortedBy.value !== ESortBy.Search_Score) {
				_sort(sortedBy.value, cOut)
			}
		}

		cOut = _find._ApplyAllQueryFilters(cOut, query)
		searchResults.value = markRaw(cOut)
		return cOut
	}

	function resetSearch() {
		searchResults.value = null
		activeQuery.value = {}
	}

	// -----------------------------------------------------------

	function getOwned(cardId: number): number {
		return ownedCards.value?.[cardId] ?? 0
	}

	async function setOwned(cardId: number, count: number) {
		if (!ownedCards.value) return
		const oldVal = getOwned(cardId)
		if (!ownedCards.value[cardId]) {
			ownedCards.value[cardId] = 0
		}
		ownedCards.value[cardId] = Math.max(0, count)

		if (miniSearchIndex) {
			if (count > 0 && oldVal === 0) {
				if (!miniSearchIndex.has(cardId)) {
					const fulLCardList = await getFullCardList()
					const card = fulLCardList.find((c) => c.id === cardId)
					if (card) {
						ownedCardList.value.unshift(card)
						miniSearchIndex.add(card)
					}
				}
			} else if (count === 0 && oldVal > 0) {
				if (miniSearchIndex.has(cardId)) {
					ownedCardList.value = ownedCardList.value.filter((c) => c.id !== cardId)
					miniSearchIndex.discard(cardId)
				}
			}
		}

		_cleanup(cardId)
		save()
	}

	const incrementOwned = (cardId: number) => setOwned(cardId, getOwned(cardId) + 1)
	const decrementOwned = (cardId: number) => setOwned(cardId, getOwned(cardId) - 1)

	function _cleanup(cardId: number) {
		const entry = ownedCards.value?.[cardId]
		if (entry != undefined && entry <= 0) {
			delete ownedCards.value![cardId]
		}
	}

	// -----------------------------------------------------------

	function save() {
		if (saveTimeout) {
			clearTimeout(saveTimeout)
		}
		saveTimeout = setTimeout(async () => {
			await Files.write(PATH, toRaw(ownedCards.value))
			saveTimeout = null
		}, SAVE_DEBOUNCE_MS)
	}

	function reinitializeMarkedCards() {
		initialized.value = 'uninitialized'
		ownedCards.value = {}
		_init()
	}

	return {
		ownedCards,
		ownedCardList,
		sort,
		search,
		resetSearch,

		getOwned,
		setOwned,
		incrementOwned,
		decrementOwned,

		initialized,
		save,
		reinitializeMarkedCards,
	}
}

function _searchTerm(term: string, cardList?: TCardData[]) {
	if (!miniSearchIndex) return []

	let results = miniSearchIndex
		.search(term)
		.filter((result) => result.score >= MIN_SCORE_THRESHOLD)

	if (cardList && cardList.length > 0) {
		const filteredCardIds = new Set(cardList.map((card) => card.id))
		results = results.filter((result) => filteredCardIds.has(result.id))
	}

	return results as unknown as TSearchResultCardData[]
}

async function _readOwnedCards() {
	if (ownedCards.value) return ownedCards.value
	const data = await _get()
	ownedCards.value = data
	return data

	async function _get() {
		const e = await Files.exists(PATH)
		if (!e.exists) {
			await Files.write(PATH, {})
			return {}
		}
		const read = (await Files.read(PATH)) as IMarkedCards
		return read || {}
	}
}

function getReadyCardIds() {
	if (ownedCards.value) return ownedCards.value
	else return {}
}

export {useOwnedCards, getReadyCardIds}
