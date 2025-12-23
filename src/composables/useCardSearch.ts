import {getCardList} from '@/libs/CardData'
import {
	TCardData,
	TFrameType,
	TMonsterAttribute,
	TMonsterRace,
	TMonsterType,
	TSpellTypes,
	TTrapTypes,
} from '@/libs/interfaces/YGOProInterfaces'
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
		initialized = true

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
				'misc_info',
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
		activeQuery.value = {}
		searchResults.value = null
		return miniSearch
	}
	const search = (query: TSearchQuery, maxResults: number = 200) => {
		if (!miniSearchIndex) return []
		activeQuery.value = query
		if (_searchQueryIsEmpty(query)) {
			searchResults.value = null
			return []
		}

		let cOut = fullCardList.value

		// Apply Core Type Filter
		if (query.coreCardType) {
			cOut = _searchCoreCardType(query.coreCardType, cOut)
		}

		//  Apply Spell/Trap Type Filters
		if (
			query.spellTypes &&
			query.spellTypes.length > 0 &&
			!['Monster'].includes(query.coreCardType || '')
		) {
			cOut = _searchSpellTrapType(query.spellTypes, cOut)
		}

		if (
			query.trapTypes &&
			query.trapTypes.length > 0 &&
			!['Monster'].includes(query.coreCardType || '')
		) {
			cOut = _searchSpellTrapType(query.trapTypes, cOut)
		}

		//  Apply Attribute Filters
		if (
			query.attributes &&
			query.attributes.length > 0 &&
			!['Spell', 'Trap'].includes(query.coreCardType || '')
		) {
			cOut = _searchAttribute(query.attributes, cOut)
		}

		// Apply Monster Type Filter
		if (
			query.monsterType &&
			query.monsterType.terms.length > 0 &&
			!['Spell', 'Trap'].includes(query.coreCardType || '')
		) {
			cOut = _searchMonsterType(query.monsterType, cOut)
		}

		// Apply Monster Race Filter
		if (
			query.monsterRaces &&
			query.monsterRaces.length > 0 &&
			!['Spell', 'Trap'].includes(query.coreCardType || '')
		) {
			cOut = _searchMonsterRace(query.monsterRaces, cOut)
		}

		// Apply Term Search
		if (query.term && query.term.length > 0) {
			const termResults = _searchTerm(query.term, maxResults, cOut)
			cOut = termResults
		}

		searchResults.value = cOut
		return cOut
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
	coreCardType?: TCoreCardType
	attributes?: TMonsterAttribute[]
	monsterType?: {terms: TMonsterType[]; operand: 'AND' | 'OR'}
	monsterRaces?: TMonsterRace[]
	spellTypes?: TSpellTypes[]
	trapTypes?: TTrapTypes[]
}
export type TCoreCardType = 'Monster' | 'Spell' | 'Trap'

// endregion
// -----------------------------------------------------------
// region Helper Functions
// -----------------------------------------------------------

function _filterCardData(cardData: TCardData[], filteredFields: TFrameType[]) {
	return cardData.filter((card) => {
		return !filteredFields.includes(card.frameType)
	})
}

function _searchQueryIsEmpty(query: TSearchQuery) {
	return (
		!query.term &&
		!query.coreCardType &&
		(!query.attributes || query.attributes.length === 0) &&
		(!query.monsterType || query.monsterType.terms.length === 0) &&
		(!query.monsterRaces || query.monsterRaces.length === 0) &&
		(!query.spellTypes || query.spellTypes.length === 0) &&
		(!query.trapTypes || query.trapTypes.length === 0)
	)
}

function _searchCoreCardType(type: TCoreCardType, cardList: TCardData[]) {
	if (!type) return cardList

	return cardList.filter((card) => {
		const frameType = card.frameType
		switch (type) {
			case 'Monster':
				return frameType !== 'spell' && frameType !== 'trap'
			case 'Spell':
				return frameType === 'spell'
			case 'Trap':
				return frameType === 'trap'
			default:
				return false
		}
	})
}

function _searchAttribute(
	attributes: TMonsterAttribute[],
	cardList: TCardData[]
) {
	if (!attributes || attributes.length === 0) return cardList

	return cardList.filter((card) => {
		// Only monster cards have attributes
		if ('attribute' in card && card.attribute) {
			return attributes.includes(card.attribute as TMonsterAttribute)
		}
		return false
	})
}

function _searchMonsterType(
	monsterType: {terms: TMonsterType[]; operand: 'AND' | 'OR'},
	cardList: TCardData[]
) {
	if (!monsterType || monsterType.terms.length === 0) return cardList
	if (monsterType.operand === 'OR') {
		return cardList.filter((card) => {
			return card.typeline?.some((line) =>
				monsterType.terms.includes(line as TMonsterType)
			)
		})
	}
	// 'AND'
	return cardList.filter((card) => {
		return monsterType.terms.every((term) => card.typeline?.includes(term))
	})
}

function _searchMonsterRace(
	monsterRaces: TMonsterRace[],
	cardList: TCardData[]
) {
	if (!monsterRaces || monsterRaces.length === 0) return cardList
	return cardList.filter((card) => {
		return card.race && monsterRaces.includes(card.race as TMonsterRace)
	})
}

function _searchSpellTrapType(
	types: TSpellTypes[] | TTrapTypes[],
	cardList: TCardData[]
) {
	if (!types || types.length === 0) return cardList

	return cardList.filter((card) => {
		return (
			card.race && types.includes(card.race as TSpellTypes & TTrapTypes)
		)
	})
}

function _searchTerm(term: string, maxResults: number, cardList: TCardData[]) {
	if (!miniSearchIndex) return []

	// Create a set of IDs from the filtered card list for quick lookup
	const filteredCardIds = new Set(cardList.map((card) => card.id))

	// First try exact phrase matching for better precision
	const exactResults = miniSearchIndex
		.search(`"${term}"`, {
			fuzzy: false,
			prefix: false,
			boost: {name: 20, archetype: 5, desc: 1},
		})
		.filter((result) => filteredCardIds.has(result.id)) // Filter by pre-filtered cards

	// If we have good exact matches, prioritize them
	if (exactResults.length > 0) {
		const exactCards = exactResults.slice(
			0,
			maxResults
		) as unknown as TSearchResultCardData[]

		// If exact results are sufficient, return them
		if (
			exactCards.length >= 5 ||
			exactResults.some((result) => result.score > 5)
		) {
			return exactCards
		}
	}

	// Otherwise, fall back to fuzzy search with stricter filtering
	const fuzzyResults = miniSearchIndex
		.search(term, {
			fuzzy: 0.1,
			prefix: true,
			boost: {name: 10, archetype: 3, desc: 1},
			combineWith: 'AND',
		})
		.filter((result) => filteredCardIds.has(result.id)) // Filter by pre-filtered cards

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
	return combinedResults
}
