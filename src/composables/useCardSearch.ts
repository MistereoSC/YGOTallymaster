import {getCardList} from '@/libs/CardData'
import {
	TCardData,
	TFrameType,
	TLinkMarkers,
	TMonsterAttribute,
	TMonsterRace,
	TMonsterType,
	TSpellTypes,
	TTrapTypes,
} from '@/libs/interfaces/YGOProInterfaces'
import MiniSearch from 'minisearch'
import {ref, markRaw} from 'vue'

export enum ESortBy {
	Name_Asc = 'Name (Ascending)',
	Name_Desc = 'Name (Descending)',
	TCG_Date_Asc = 'TCG Date (Ascending)',
	TCG_Date_Desc = 'TCG Date (Descending)',
}

let miniSearchIndex = null as null | MiniSearch<TCardData>
let initialized = false
let searchResults = ref(null as TCardData[] | null)
let activeQuery = ref<TSearchQuery>({})
let fullCardList = ref([] as TCardData[])
let sortedBy = ref(ESortBy.Name_Asc)

const useCardSearch = () => {
	_init()

	async function _init(force = false) {
		if (initialized && !force) return
		initialized = true

		const stopWords = new Set([
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
		sortedBy.value = ESortBy.Name_Asc
		return miniSearch
	}
	const search = (query: TSearchQuery, maxResults: number = 512) => {
		if (!miniSearchIndex) return []
		activeQuery.value = query
		if (_searchQueryIsEmpty(query)) {
			searchResults.value = null
			return []
		}

		let cOut = fullCardList.value

		if (query.term && query.term.length > 0) {
			cOut = _searchTerm(query.term, maxResults, cOut)
		}

		// Apply Core Type Filter
		if (query.coreCardType) {
			cOut = _searchCoreCardType(query.coreCardType, cOut)
		}

		// Apply Spell/Trap Filters
		if (query.spellTypes && query.spellTypes.length > 0) {
			cOut = _searchSpellTrapType(query.spellTypes, cOut)
		}

		if (query.trapTypes && query.trapTypes.length > 0) {
			cOut = _searchSpellTrapType(query.trapTypes, cOut)
		}

		// Apply Monster Filters
		if (query.scales && query.scales.length > 0) {
			cOut = _searchPendulumScales(query.scales, cOut)
		}

		if (query.linkvals && query.linkvals.length > 0) {
			cOut = _searchLinkvals(query.linkvals, cOut)
		}

		if (query.attributes && query.attributes.length > 0) {
			cOut = _searchAttribute(query.attributes, cOut)
		}

		if (query.monsterTypes && query.monsterTypes.terms.length > 0) {
			cOut = _searchMonsterType(query.monsterTypes, cOut)
		}

		if (query.monsterRaces && query.monsterRaces.length > 0) {
			cOut = _searchMonsterRace(query.monsterRaces, cOut)
		}

		if (query.levels && query.levels.length > 0) {
			cOut = _searchMonsterLevels(query.levels, cOut)
		}

		if (query.links && query.links.terms.length > 0) {
			cOut = _searchLinkmarkers(query.links, cOut)
		}

		if (
			(query.atk && (query.atk.gte != null || query.atk.lte != null)) ||
			(query.def && (query.def.gte != null || query.def.lte != null))
		) {
			cOut = _searchAtkAndDef(cOut, query.atk, query.def)
		}

		searchResults.value = markRaw(cOut)
		return cOut
	}
	const resetSearch = () => {
		searchResults.value = null
		activeQuery.value = {}
	}
	function reinitializeIndex() {
		_init(true)
	}

	function sort(by?: ESortBy) {
		if (!by && sortedBy.value === ESortBy.Name_Asc) return
		else if (by === sortedBy.value) return
		sortedBy.value = by ?? ESortBy.Name_Asc

		fullCardList.value = _sort(by ?? ESortBy.Name_Asc, fullCardList.value)
		if (searchResults.value) {
			searchResults.value = markRaw(
				_sort(by ?? ESortBy.Name_Asc, [...searchResults.value])
			)
		}
	}

	return {
		search,
		resetSearch,
		searchResults,
		activeQuery,
		fullCardList,
		reinitializeIndex,
		sort,
		sortedBy,
	}
}

export {useCardSearch}

// -----------------------------------------------------------
// #region Interfaces
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
	monsterTypes?: {terms: TMonsterType[]; operand: 'AND' | 'OR'}

	atk?: {lte?: number | null; gte?: number | null}
	def?: {lte?: number | null; gte?: number | null}
	levels?: number[]
	scales?: number[]
	linkvals?: number[]
	links?: {terms: TLinkMarkers[]; operand: 'AND' | 'OR'}

	monsterRaces?: TMonsterRace[]
	spellTypes?: TSpellTypes[]
	trapTypes?: TTrapTypes[]
}
export type TCoreCardType = 'Monster' | 'Spell' | 'Trap'

// #endregion
// -----------------------------------------------------------
// #region Helper Functions
// -----------------------------------------------------------

function _filterCardData(cardData: TCardData[], filteredFields: TFrameType[]) {
	return cardData.filter((card) => {
		return !filteredFields.includes(card.frameType)
	})
}

// #endregion
// -----------------------------------------------------------
// #region Search Functions
// -----------------------------------------------------------

function _searchQueryIsEmpty(query: TSearchQuery) {
	return !(
		query.term ||
		query.coreCardType ||
		(query.attributes && query.attributes.length != 0) ||
		(query.monsterTypes && query.monsterTypes.terms.length != 0) ||
		(query.monsterRaces && query.monsterRaces.length != 0) ||
		(query.spellTypes && query.spellTypes.length != 0) ||
		(query.trapTypes && query.trapTypes.length != 0) ||
		(query.levels && query.levels.length != 0) ||
		(query.links && query.links.terms.length != 0) ||
		(query.linkvals && query.linkvals.length != 0) ||
		(query.scales && query.scales.length != 0) ||
		(query.atk &&
			(query.atk.lte != undefined || query.atk.gte != undefined)) ||
		(query.def &&
			(query.def.lte != undefined || query.def.gte != undefined))
	)
}

function _searchAtkAndDef(
	cardList: TCardData[],
	atk?: {lte?: number | null; gte?: number | null},
	def?: {lte?: number | null; gte?: number | null}
) {
	if ((!atk || (!atk.gte && !atk.lte)) && (!def || (!def.gte && !def.lte)))
		return cardList

	return cardList.filter((card) => {
		const cardAtk = card.atk || 0
		const cardDef = card.def || 0

		if (atk) {
			if (atk.lte != null && cardAtk > atk.lte) return false
			if (atk.gte != null && cardAtk < atk.gte) return false
		}

		if (def) {
			if (def.lte != null && cardDef > def.lte) return false
			if (def.gte != null && cardDef < def.gte) return false
		}

		return true
	})
}

function _searchMonsterLevels(levels: number[], cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.level && levels.includes(card.level)
	})
}

function _searchPendulumScales(scales: number[], cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.scale && scales.includes(card.scale)
	})
}

function _searchLinkvals(linkvals: number[], cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.linkval && linkvals.includes(card.linkval)
	})
}

function _searchMonsterRace(
	monsterRaces: TMonsterRace[],
	cardList: TCardData[]
) {
	return cardList.filter((card) => {
		return card.race && monsterRaces.includes(card.race as TMonsterRace)
	})
}

function _searchAttribute(
	attributes: TMonsterAttribute[],
	cardList: TCardData[]
) {
	return cardList.filter((card) => {
		return (
			'attribute' in card &&
			card.attribute &&
			attributes.includes(card.attribute as TMonsterAttribute)
		)
	})
}

function _searchCoreCardType(type: TCoreCardType, cardList: TCardData[]) {
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

function _searchMonsterType(
	monsterType: {terms: TMonsterType[]; operand: 'AND' | 'OR'},
	cardList: TCardData[]
) {
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

function _searchLinkmarkers(
	links: {terms: TLinkMarkers[]; operand: 'AND' | 'OR'},
	cardList: TCardData[]
) {
	if (links.operand === 'OR') {
		return cardList.filter((card) => {
			return card.linkmarkers?.some((marker) =>
				links.terms.includes(marker as TLinkMarkers)
			)
		})
	}
	// 'AND'
	return cardList.filter((card) => {
		return links.terms.every((term) => card.linkmarkers?.includes(term))
	})
}

function _searchSpellTrapType(
	types: TSpellTypes[] | TTrapTypes[],
	cardList: TCardData[]
) {
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
			exactResults.some((result) => result.score > 200)
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

// #endregion
// -----------------------------------------------------------
// #region Sort Functions
// -----------------------------------------------------------

function _sort(by: ESortBy, cardList: TCardData[]) {
	switch (by) {
		case ESortBy.Name_Asc:
			return cardList.sort((a, b) => a.name.localeCompare(b.name))
		case ESortBy.Name_Desc:
			return cardList.sort((a, b) => b.name.localeCompare(a.name))
		case ESortBy.TCG_Date_Asc:
			return cardList.sort((a, b) => {
				const dateA =
					a.misc_info[0]?.tcg_date || a.misc_info[0]?.ocg_date
				const dateB =
					b.misc_info[0]?.tcg_date || b.misc_info[0]?.ocg_date

				// Handle missing dates - put them at the end for ascending order
				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

				// Compare dates lexicographically (YYYY-MM-DD format works with string comparison)
				const dateComparison = dateA.localeCompare(dateB)
				// If dates are equal, sort by name as secondary criteria
				return dateComparison === 0
					? a.name.localeCompare(b.name)
					: dateComparison
			})
		case ESortBy.TCG_Date_Desc:
			return cardList.sort((a, b) => {
				const dateA =
					a.misc_info[0]?.tcg_date || a.misc_info[0]?.ocg_date
				const dateB =
					b.misc_info[0]?.tcg_date || b.misc_info[0]?.ocg_date

				// Handle missing dates - put them at the end for descending order
				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

				// Compare dates lexicographically in reverse order
				const dateComparison = dateB.localeCompare(dateA)
				// If dates are equal, sort by name as secondary criteria
				return dateComparison === 0
					? a.name.localeCompare(b.name)
					: dateComparison
			})
		default:
			return cardList
	}
}

// #endregion
// -----------------------------------------------------------
