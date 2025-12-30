import {getCardList} from '@/libs/CardData'
import {
	TCardData,
	TLinkMarkers,
	TMonsterAttribute,
	TMonsterRace,
	TMonsterType,
	TSpellTypes,
	TTrapTypes,
} from '@/libs/interfaces/YGOProInterfaces'
import MiniSearch from 'minisearch'
import {ref, markRaw} from 'vue'

// -----------------------------------------------------------
// #region Constants
// -----------------------------------------------------------

const MIN_SCORE_THRESHOLD: Readonly<number> = 2
const STOP_WORDS = new Set([
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
const STORE_FIELDS = [
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
]
const TOKENIZE_FN = (text: string) => {
	// Custom tokenizer with bigram support that preserves D/D/D/D patterns
	const baseTokens = text
		.toLowerCase()
		// Normalize special characters and symbols to common equivalents
		.replace(/☆/g, '-') // Star symbol to "star"
		.replace(/★/g, '-') // Filled star to "star"

		// First, protect D/D/D/D patterns by replacing slashes with a placeholder
		.replace(/\bd(\/d)+\b/g, (match) => match.replace(/\//g, '___SLASH___'))
		// Also protect other slash-separated terms that might be important
		.replace(/\b\w+\/\w+(?:\/\w+)*\b/g, (match) =>
			match.replace(/\//g, '___SLASH___')
		)
		// Split on whitespace and hyphens
		.split(/[\s-]+/)
		// Restore the slashes
		.map((token) => token.replace(/___SLASH___/g, '/'))
		// Filter out empty tokens
		.filter((token) => token.length > 0)

	const tokens = [...baseTokens] // Start with individual tokens

	// Add bigrams (pairs of adjacent tokens)
	for (let i = 0; i < baseTokens.length - 1; i++) {
		const bigram = `${baseTokens[i]} ${baseTokens[i + 1]}`
		tokens.push(bigram)
	}

	return tokens
}

export enum ESortBy {
	Name_Asc = 'Name (Ascending)',
	Name_Desc = 'Name (Descending)',
	TCG_Date_Asc = 'TCG Date (Ascending)',
	TCG_Date_Desc = 'TCG Date (Descending)',
	Search_Score = 'Text Search Score',
	ATK_Asc = 'ATK (Ascending)',
	ATK_Desc = 'ATK (Descending)',
	DEF_Asc = 'DEF (Ascending)',
	DEF_Desc = 'DEF (Descending)',
	Type = 'Card Type',
}

// #endregion
// -----------------------------------------------------------
// #region Singleton useCardSearch
// -----------------------------------------------------------

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

		const cardData = _initialFilterCardData(await getCardList())
		fullCardList.value = cardData

		const miniSearch = new MiniSearch({
			fields: ['name', 'desc', 'archetype'],
			storeFields: STORE_FIELDS,
			searchOptions: {
				fuzzy: 0.3,
				prefix: true,
				boost: {name: 6, archetype: 2, desc: 1},
				combineWith: 'AND',
			},
			processTerm: (term, _fieldName) =>
				STOP_WORDS.has(term) ? null : term.toLowerCase(),
			tokenize: TOKENIZE_FN,
		})
		miniSearch.addAll(cardData as TCardData[])

		miniSearchIndex = miniSearch
		activeQuery.value = {}
		searchResults.value = null
		sortedBy.value = ESortBy.Name_Asc
		return miniSearch
	}
	const search = (query: TSearchQuery) => {
		if (!miniSearchIndex) return []
		activeQuery.value = query
		if (_searchQueryIsEmpty(query)) {
			searchResults.value = null
			return []
		}

		let cOut = fullCardList.value

		if (query.term && query.term.length > 0) {
			cOut = _searchTerm(query.term)
			if (sortedBy.value !== ESortBy.Search_Score) {
				_sort(sortedBy.value, cOut)
			}
		}

		cOut = _applyQueryFilters(cOut, query)

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

const useListSearch = (cardIdInput: TCardIdInput) => {
	let l_initialized = false
	let l_miniSearchIndex = null as null | MiniSearch<TCardData>
	let l_searchResults = ref(null as TCardData[] | null)
	let l_activeQuery = ref<TSearchQuery>({})
	let l_fullCardList = ref([] as TCardData[])
	let l_sortedBy = ref(ESortBy.Name_Asc)
	_init()

	async function _init(force = false) {
		if (l_initialized && !force) return
		l_initialized = true

		const cardIdSet = Array.isArray(cardIdInput)
			? new Set(cardIdInput)
			: new Set(Object.keys(cardIdInput).map(Number))
		const cardData = _initialFilterCardData(await getCardList())
		if (!fullCardList.value) fullCardList.value = cardData
		l_fullCardList.value = cardData.filter((card) => cardIdSet.has(card.id))

		const miniSearch = new MiniSearch({
			fields: ['name', 'desc', 'archetype'],
			storeFields: STORE_FIELDS,
			searchOptions: {
				fuzzy: 0.3,
				prefix: true,
				boost: {name: 6, archetype: 2, desc: 1},
				combineWith: 'AND',
			},
			processTerm: (term, _fieldName) =>
				STOP_WORDS.has(term) ? null : term.toLowerCase(),
			tokenize: TOKENIZE_FN,
		})
		miniSearch.addAll(cardData as TCardData[])

		l_miniSearchIndex = miniSearch
		l_activeQuery.value = {}
		l_searchResults.value = null
		l_sortedBy.value = ESortBy.Name_Asc
		return miniSearch
	}
	const search = (query: TSearchQuery) => {
		if (!l_miniSearchIndex) return []
		l_activeQuery.value = query
		if (_searchQueryIsEmpty(query)) {
			l_searchResults.value = null
			return []
		}

		let cOut = l_fullCardList.value

		if (query.term && query.term.length > 0) {
			cOut = _searchTerm(query.term)
			if (l_sortedBy.value !== ESortBy.Search_Score) {
				_sort(l_sortedBy.value, cOut)
			}
		}

		cOut = _applyQueryFilters(cOut, query)

		l_searchResults.value = markRaw(cOut)
		return cOut
	}
	const resetSearch = () => {
		l_searchResults.value = null
		l_activeQuery.value = {}
	}
	function reinitializeIndex() {
		_init(true)
	}

	function sort(by?: ESortBy) {
		if (!by && l_sortedBy.value === ESortBy.Name_Asc) return
		else if (by === l_sortedBy.value) return
		l_sortedBy.value = by ?? ESortBy.Name_Asc

		l_fullCardList.value = _sort(
			by ?? ESortBy.Name_Asc,
			l_fullCardList.value
		)
		if (l_searchResults.value) {
			l_searchResults.value = markRaw(
				_sort(by ?? ESortBy.Name_Asc, [...l_searchResults.value])
			)
		}
	}

	return {
		search,
		resetSearch,
		searchResults: l_searchResults,
		activeQuery: l_activeQuery,
		fullCardList: l_fullCardList,
		reinitializeIndex,
		sort,
		indexCard,
		deindexCard,
		sortedBy: l_sortedBy,
	}

	function indexCard(cardId: number) {
		console.log('INDEXING', cardId)

		if (!l_miniSearchIndex) return
		if (l_miniSearchIndex.has(cardId)) return
		const card = fullCardList.value.find((c) => c.id === cardId)
		if (card) {
			l_fullCardList.value.push(card)
			l_miniSearchIndex.add(card)
		}
	}
	function deindexCard(cardId: number) {
		console.log('DEINDEXING', cardId)

		if (!l_miniSearchIndex) return
		if (!l_miniSearchIndex.has(cardId)) return
		l_fullCardList.value = l_fullCardList.value.filter(
			(c) => c.id !== cardId
		)
		l_miniSearchIndex.discard(cardId)
	}
}

export {useCardSearch, useListSearch}

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
type TCardIdInput = number[] | Record<number, unknown>

// #endregion
// -----------------------------------------------------------
// #region Helper Functions
// -----------------------------------------------------------

function _initialFilterCardData(cardData: TCardData[]) {
	const filteredFields = ['token', 'skill']
	return cardData.filter((card) => {
		return !filteredFields.includes(card.frameType)
	})
}

// #endregion
// -----------------------------------------------------------
// #region Search Functions
// -----------------------------------------------------------

function _applyQueryFilters(
	cardList: TCardData[] | TSearchResultCardData[],
	query: TSearchQuery
) {
	let cOut = cardList
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
	return cOut
}

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
// #endregion
// -----------------------------------------------------------
// #region Sort Functions
// -----------------------------------------------------------

function _sort(by: ESortBy, cardList: TCardData[]) {
	switch (by) {
		case ESortBy.Search_Score:
			if (activeQuery.value.term)
				return _sortBySearchScore(cardList as TSearchResultCardData[])
			return cardList.sort((a, b) => a.name.localeCompare(b.name))
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

				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

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

				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

				const dateComparison = dateB.localeCompare(dateA)
				// If dates are equal, sort by name as secondary criteria
				return dateComparison === 0
					? a.name.localeCompare(b.name)
					: dateComparison
			})
		case ESortBy.ATK_Asc:
			return cardList.sort((a, b) => {
				const atkA = a.atk !== undefined ? a.atk : 9999
				const atkB = b.atk !== undefined ? b.atk : 9999

				const atkComparison = atkA - atkB
				// If ATK values are equal, sort by name as secondary criteria
				return atkComparison === 0
					? a.name.localeCompare(b.name)
					: atkComparison
			}) // Use -2 for cards without ATK
		case ESortBy.ATK_Desc:
			return cardList.sort((a, b) => {
				const atkA = a.atk !== undefined ? a.atk : -2
				const atkB = b.atk !== undefined ? b.atk : -2

				const atkComparison = atkB - atkA
				// If ATK values are equal, sort by name as secondary criteria
				return atkComparison === 0
					? a.name.localeCompare(b.name)
					: atkComparison
			})
		case ESortBy.DEF_Asc:
			return cardList.sort((a, b) => {
				const defA = a.linkval
					? 9900
					: a.def !== undefined
					? a.def
					: 9999
				const defB = b.linkval
					? 9900
					: b.def !== undefined
					? b.def
					: 9999

				const defComparison = defA - defB
				// If DEF values are equal, sort by name as secondary criteria
				return defComparison === 0
					? a.name.localeCompare(b.name)
					: defComparison
			})
		case ESortBy.DEF_Desc:
			return cardList.sort((a, b) => {
				const defA = a.linkval ? -2 : a.def !== undefined ? a.def : -3
				const defB = b.linkval ? -2 : b.def !== undefined ? b.def : -3

				const defComparison = defB - defA
				// If DEF values are equal, sort by name as secondary criteria
				return defComparison === 0
					? a.name.localeCompare(b.name)
					: defComparison
			})
		case ESortBy.Type:
			return cardList.sort((a, b) => {
				const isMonsterA = a.attribute ? true : false
				const isMonsterB = b.attribute ? true : false
				const isSpellA = a.frameType === 'spell'
				const isSpellB = b.frameType === 'spell'

				if (isMonsterA && !isMonsterB) return -1
				if (!isMonsterA && isMonsterB) return 1
				if (isSpellA && !isSpellB) return -1
				if (!isSpellA && isSpellB) return 1

				// If both are the same type, sort by race
				const raceComparison = a.race?.localeCompare(b.race ?? '') ?? 0
				return raceComparison === 0
					? a.name.localeCompare(b.name)
					: raceComparison
			})

		default:
			return cardList
	}
}

function _sortBySearchScore(cardList: TSearchResultCardData[]) {
	return cardList.sort((a, b) => {
		const scoreA = a.score !== undefined ? a.score : -1
		const scoreB = b.score !== undefined ? b.score : -1
		return scoreB - scoreA
	}) as TCardData[]
}
// #endregion
// -----------------------------------------------------------
