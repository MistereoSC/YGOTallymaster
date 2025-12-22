import {getCardList} from '@/libs/CardData'
import {TCardData, TFrameType} from '@/libs/interfaces/YGOProInterfaces'
import MiniSearch from 'minisearch'
import {ref} from 'vue'

let miniSearchIndex = null as null | MiniSearch<TCardData>
let initialized = false
let searchResults = ref(null as TCardData[] | null)
let activeQuery = ref<TSearchQuery>({})
let fullCardList = ref([] as TCardData[])
const useCardSearch = () => {
	_init()

	async function _init(force = false) {
		if (initialized && !force) return
		let stopWords = new Set([
			'and',
			'or',
			'to',
			'in',
			'a',
			'the',
			'for',
			'of',
			'is',
			'it',
			'an',
			'as',
			'at',
			'be',
			'by',
			'on',
			'with',
			'from',
		])
		const cardData = _filterCardData(await getCardList(), [
			'token',
			'skill',
		])
		fullCardList.value = cardData

		const miniSearch = new MiniSearch({
			fields: ['name', 'desc', 'archetype'],
			storeFields: [
				// TGeneralCardData fields
				'id',
				'name',
				'frameType',
				'desc',
				'ygoprodeck_url',
				'images',
				'card_sets',
				'card_prices',
				'archetype',
				// TMonsterCardData fields (partial)
				'atk',
				'def',
				'level',
				'attribute',
				'scale',
				'linkval',
				'linkmarkers',
				'race',
				'typeline',
				// TCardDataMisc fields
				'views',
				'viewsweek',
				'upvotes',
				'downvotes',
				'formats',
				'treated_as',
				'tcg_date',
				'ocg_date',
				'konami_id',
				'md_rarity',
				'has_effect',
				'genesys_points',
			],
			searchOptions: {
				fuzzy: 0.2,
				prefix: true,
				boost: {name: 10, archetype: 3, desc: 1},
				combineWith: 'AND',
			},
			processTerm: (term, _fieldName) =>
				stopWords.has(term) ? null : term.toLowerCase(),
		})
		miniSearch.addAll(cardData as TCardData[])
		miniSearchIndex = miniSearch
		initialized = true
		activeQuery.value = {}
		searchResults.value = null
		return miniSearch
	}
	const search = (query: string, maxResults: number = 200) => {
		if (!miniSearchIndex) return []

		// First try exact phrase matching for better precision
		const exactResults = miniSearchIndex.search(`"${query}"`, {
			fuzzy: false,
			prefix: false,
			boost: {name: 20, archetype: 5, desc: 1},
		})

		// If we have good exact matches, prioritize them
		if (exactResults.length > 0) {
			const exactCards = exactResults.slice(
				0,
				maxResults
			) as unknown as TCardData[]

			// If exact results are sufficient, return them
			if (
				exactCards.length >= 5 ||
				exactResults.some((result) => result.score > 5)
			) {
				searchResults.value = exactCards
				return exactCards
			}
		}

		// Otherwise, fall back to fuzzy search with stricter filtering
		const fuzzyResults = miniSearchIndex.search(query, {
			fuzzy: 0.1,
			prefix: true,
			boost: {name: 10, archetype: 3, desc: 1},
			combineWith: 'AND',
		})

		// Filter out results with very low scores to reduce noise
		const filteredResults = fuzzyResults
			.filter((result) => result.score > 0.5)
			.slice(0, maxResults)

		// Combine exact and fuzzy results, removing duplicates
		const exactIds = new Set(exactResults.map((r) => r.id))
		const combinedResults = [
			...exactResults,
			...filteredResults.filter((r) => !exactIds.has(r.id)),
		].slice(0, maxResults) as unknown as TSearchResultCardData[]

		searchResults.value = combinedResults
		activeQuery.value = {term: query}
		return combinedResults
	}
	const resetSearch = () => {
		searchResults.value = null
		activeQuery.value = {}
	}
	function reinitializeIndex() {
		_init(true)
	}

	return {
		search,
		resetSearch,
		searchResults,
		activeQuery,
		fullCardList,
		reinitializeIndex,
	}
}
export {useCardSearch}

// -----------------------------------------------------------
// region Interfaces
// -----------------------------------------------------------

export type TSearchResultCardData = TCardData & {
	score: number
	terms: string[]
	queryTerms: string[]
	match: Record<string, string[]>
}
export type TSearchQuery = {
	term?: string
}

// endregion
// -----------------------------------------------------------
// region Helper Functions
// -----------------------------------------------------------

function _filterCardData(cardData: TCardData[], filteredFields: TFrameType[]) {
	return cardData.filter((card) => {
		return !filteredFields.includes(card.frameType)
	})
}
