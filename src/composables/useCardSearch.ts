import {getCardList} from '@/libs/CardData'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import MiniSearch from 'minisearch'
import {ref} from 'vue'

let miniSearchIndex = null as null | MiniSearch<TCardData>
let initialized = false
let searchResults = ref([] as TCardData[])
let activeQuery = ref<TSearchQuery>({})
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
		const cardData = await getCardList()
		const miniSearch = new MiniSearch({
			fields: ['name', 'desc', 'archetype'],
			storeFields: [
				'id',
				'name',
				'desc',
				'frameType',
				'ygoprodeck_url',
				'images',
				'card_sets',
				'card_prices',
				'archetype',
				'atk',
				'def',
				'level',
				'attribute',
				'race',
				'scale',
				'linkval',
				'linkmarkers',
				'typeline',
			],
			searchOptions: {
				// Reduce fuzzy matching for more precise results
				fuzzy: 0.1,
				// Keep prefix matching but it will be more controlled
				prefix: true,
				// Increase name boost significantly for exact matches
				boost: {name: 10, archetype: 3, desc: 1},
				// Add combineWith to require all terms to match
				combineWith: 'AND',
			},
			processTerm: (term, _fieldName) =>
				stopWords.has(term) ? null : term.toLowerCase(),
		})
		miniSearch.addAll(cardData as TCardData[])
		miniSearchIndex = miniSearch
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
		searchResults.value = []
		activeQuery.value = {}
	}

	function reinitializeIndex() {
		_init(true)
	}

	return {
		search,
		searchResults,
		activeQuery,
		resetSearch,
		reinitializeIndex,
	}
}

export {useCardSearch}

export type TSearchResultCardData = TCardData & {
	score: number
	terms: string[]
	queryTerms: string[]
	match: Record<string, string[]>
}
export type TSearchQuery = {
	term?: string
}
