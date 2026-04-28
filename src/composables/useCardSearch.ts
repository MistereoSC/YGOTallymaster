import {getCardList} from '@/libs/CardData'
import {IMarkedCards} from '@/libs/interfaces/CardSets'
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
import {getReadyCardIds} from './useOwnedCards'
import {getSetCardIds} from './useCardCollections'
import {ESortBy, ESortByPriceCM, ESortByPriceTCGP} from '@/libs/interfaces/searchTypes'
import {getSettings} from './useDatabaseSettings'

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
	'banlist_info',
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
		.replace(/☆/g, '-')
		.replace(/★/g, '-')
		.replace(/"/g, ' " ')

		// First, protect D/D/D/D patterns by replacing slashes with a placeholder
		.replace(/\bd(\/d)+\b/g, (match) => match.replace(/\//g, '___SLASH___'))
		// Also protect other slash-separated terms that might be important
		.replace(/\b\w+\/\w+(?:\/\w+)*\b/g, (match) => match.replace(/\//g, '___SLASH___'))
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

// Re-export ESortBy from searchTypes to maintain backwards compatibility
export {ESortBy, ESortByPriceCM, ESortByPriceTCGP} from '@/libs/interfaces/searchTypes'

// #endregion
// -----------------------------------------------------------
// #region Singleton useCardSearch
// -----------------------------------------------------------

let miniSearchIndex = null as null | MiniSearch<TCardData>
const initialized = ref('uninitialized' as 'ready' | 'uninitialized' | 'loading')
const searchResults = ref(null as TCardData[] | null)
const activeQuery = ref<TSearchQuery>({})
const fullCardList = ref([] as TCardData[])
const sortedBy = ref(ESortBy.Name_Asc)

const useCardSearch = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init() {
		let cardData = [] as TCardData[]
		const settings = await getSettings()
		const language = settings.cardLanguage || 'en'
		const includeEnglishName = settings.englishNameSearch && language !== 'en'

		cardData = _initialFilterCardData(await getCardList(language))
		fullCardList.value = cardData
		miniSearchIndex = _createMinisearchIndex(cardData, includeEnglishName)

		activeQuery.value = {}
		searchResults.value = null
		sortedBy.value = ESortBy.Name_Asc
		initialized.value = 'ready'
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
		sort(ESortBy.Name_Asc)
		sortedBy.value = ESortBy.Name_Asc
		searchResults.value = null
		activeQuery.value = {}
	}
	function reinitializeIndex() {
		initialized.value = 'uninitialized'
		fullCardList.value = []
		_init()
	}

	function sort(by?: ESortBy) {
		if (!by && sortedBy.value === ESortBy.Name_Asc) return
		else if (by === sortedBy.value) return
		sortedBy.value = by ?? ESortBy.Name_Asc

		fullCardList.value = _sort(by ?? ESortBy.Name_Asc, fullCardList.value)
		if (searchResults.value) {
			searchResults.value = markRaw(_sort(by ?? ESortBy.Name_Asc, [...searchResults.value]))
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
		initialized,
	}
}
// #endregion
// -----------------------------------------------------------
// #region Public Functions
// -----------------------------------------------------------
function invalidateUseCardSearch() {
	console.debug('INVALIDATE::useCardSearch')
	miniSearchIndex = null
	initialized.value = 'uninitialized'
	searchResults.value = []
	activeQuery.value = {}
	fullCardList.value = []
	sortedBy.value = ESortBy.Name_Asc
}

async function getFullCardList() {
	if (fullCardList.value.length === 0) {
		fullCardList.value = _initialFilterCardData(await getCardList())
	}
	return fullCardList.value as TCardData[]
}
async function getCardFromId(cardId: number) {
	const cardList = await getFullCardList()
	return _findCardById(cardId, cardList)
}

export {
	useCardSearch,
	getFullCardList,
	getCardFromId,
	__getAllViableValues,
	_find,
	_sort,
	_createMinisearchIndex,
	_searchQueryIsEmpty,
	invalidateUseCardSearch,
}

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
	monsterTypes?: {terms: TMonsterType[]; operand: 'AND' | 'OR' | 'NOT'}

	atk?: {lte?: number | null; gte?: number | null}
	def?: {lte?: number | null; gte?: number | null}
	levels?: number[]
	scales?: number[]
	linkvals?: number[]
	links?: {terms: TLinkMarkers[]; operand: 'AND' | 'OR' | 'NOT'}

	monsterRaces?: TMonsterRace[]
	spellTypes?: TSpellTypes[]
	trapTypes?: TTrapTypes[]

	owned?: boolean
	staple?: boolean
	setFilter?: {collectionName: string; setName: string}
}
export type TCoreCardType = 'Monster' | 'Spell' | 'Trap'

// #endregion
// -----------------------------------------------------------
// #region Helper Functions
// -----------------------------------------------------------

function _findCardById(cardId: number, cardList: TCardData[] = fullCardList.value) {
	return cardList.find((card) => card.id === cardId)
}

function _initialFilterCardData(cardData: TCardData[]) {
	const filteredFields = ['token', 'skill']
	return cardData.filter((card) => {
		return !filteredFields.includes(card.frameType)
	})
}

function _createMinisearchIndex(cardData: TCardData[], includeEnglishName = false) {
	const searchableFields = ['name', 'desc', 'archetype']
	if (includeEnglishName) searchableFields.push('name_en')
	const miniSearch = new MiniSearch({
		fields: searchableFields,
		storeFields: STORE_FIELDS,
		searchOptions: {
			fuzzy: 0.1,
			prefix: true,
			boost: {name: 6, archetype: 3, desc: 1},
			combineWith: 'AND',
		},
		processTerm: (term, _fieldName) => (STOP_WORDS.has(term) ? null : term.toLowerCase()),
		tokenize: TOKENIZE_FN,
	})
	miniSearch.addAll(cardData as TCardData[])
	return miniSearch
}

// #endregion
// -----------------------------------------------------------
// #region Search Functions
// -----------------------------------------------------------

function _applyQueryFilters(cardList: TCardData[] | TSearchResultCardData[], query: TSearchQuery) {
	let cOut = cardList
	// Apply Set Filter (apply early to reduce the dataset)
	if (query.setFilter) {
		cOut = _searchBySet(cOut, query.setFilter)
	}

	// Apply Owned/Staple Filter
	if (query.owned) {
		cOut = _searchOwnedCards(cOut)
	}
	if (query.staple) {
		cOut = _searchStapleCards(cOut)
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
	return cOut
}

function _searchQueryIsEmpty(query: TSearchQuery) {
	return !(
		query.term ||
		query.owned ||
		query.staple ||
		query.setFilter ||
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
		(query.atk && (query.atk.lte != undefined || query.atk.gte != undefined)) ||
		(query.def && (query.def.lte != undefined || query.def.gte != undefined))
	)
}

function _searchAtkAndDef(
	cardList: TCardData[],
	atk?: {lte?: number | null; gte?: number | null},
	def?: {lte?: number | null; gte?: number | null}
) {
	if ((!atk || (!atk.gte && !atk.lte)) && (!def || (!def.gte && !def.lte))) return cardList

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

function _searchMonsterRace(monsterRaces: TMonsterRace[], cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.race && monsterRaces.includes(card.race as TMonsterRace)
	})
}

function _searchAttribute(attributes: TMonsterAttribute[], cardList: TCardData[]) {
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
	monsterType: {terms: TMonsterType[]; operand: 'AND' | 'OR' | 'NOT'},
	cardList: TCardData[]
) {
	if (monsterType.operand === 'OR') {
		return cardList.filter((card) => {
			return card.typeline?.some((line) => monsterType.terms.includes(line as TMonsterType))
		})
	}
	if (monsterType.operand === 'NOT') {
		return cardList.filter((card) => {
			return !monsterType.terms.some((term) => card.typeline?.includes(term))
		})
	}
	// 'AND'
	return cardList.filter((card) => {
		return monsterType.terms.every((term) => card.typeline?.includes(term))
	})
}

function _searchLinkmarkers(
	links: {terms: TLinkMarkers[]; operand: 'AND' | 'OR' | 'NOT'},
	cardList: TCardData[]
) {
	if (links.operand === 'OR') {
		return cardList.filter((card) => {
			return card.linkmarkers?.some((marker) => links.terms.includes(marker as TLinkMarkers))
		})
	}
	if (links.operand === 'NOT') {
		return cardList.filter((card) => {
			return !links.terms.some((term) => card.linkmarkers?.includes(term))
		})
	}
	// 'AND'
	return cardList.filter((card) => {
		return links.terms.every((term) => card.linkmarkers?.includes(term))
	})
}

function _searchSpellTrapType(types: TSpellTypes[] | TTrapTypes[], cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.race && types.includes(card.race as TSpellTypes & TTrapTypes)
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

function _searchOwnedCards(cardList: TCardData[], markedCardIds?: IMarkedCards) {
	const cIds = markedCardIds ?? getReadyCardIds()
	return cardList.filter((card) => cIds?.[card.id] && cIds?.[card.id] > 0)
}

function _searchStapleCards(cardList: TCardData[]) {
	return cardList.filter((card) => {
		return card.misc_info[0]?.staple === 'Yes'
	})
}

function _searchBySet(cardList: TCardData[], setFilter: {collectionName: string; setName: string}) {
	const setCardIds = getSetCardIds(setFilter.collectionName, setFilter.setName)
	if (!setCardIds || setCardIds.size === 0) return []
	return cardList.filter((card) => setCardIds.has(card.id))
}

function __getAllViableValues<K extends keyof TCardData>(
	key: K,
	cardList: TCardData[] = fullCardList.value
): Array<NonNullable<TCardData[K]> extends Array<infer U> ? U : NonNullable<TCardData[K]>> {
	const valuesSet = new Set<unknown>()
	for (const card of cardList) {
		const value = card[key]
		if (value === undefined || value === null) continue

		if (Array.isArray(value)) {
			// For array fields like 'linkmarkers' or 'typeline', add each element
			for (const item of value) {
				if (item !== undefined && item !== null) {
					valuesSet.add(item)
				}
			}
		} else {
			valuesSet.add(value)
		}
	}

	return Array.from(valuesSet) as Array<
		NonNullable<TCardData[K]> extends Array<infer U> ? U : NonNullable<TCardData[K]>
	>
}

const _find = {
	ID: _findCardById,
	AtkDef: _searchAtkAndDef,
	Level: _searchMonsterLevels,
	Scale: _searchPendulumScales,
	Linkval: _searchLinkvals,
	MonsterRace: _searchMonsterRace,
	Attribute: _searchAttribute,
	CoreCardType: _searchCoreCardType,
	MonsterType: _searchMonsterType,
	Linkmarkers: _searchLinkmarkers,
	SpellTrapType: _searchSpellTrapType,
	Owned: _searchOwnedCards,
	Staples: _searchStapleCards,
	BySet: _searchBySet,
	_ApplyAllQueryFilters: _applyQueryFilters,
}
// #endregion
// -----------------------------------------------------------
// #region Sort Functions
// -----------------------------------------------------------

function _sort(by: ESortBy | ESortByPriceCM | ESortByPriceTCGP, cardList: TCardData[]) {
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
				const dateA = a.misc_info[0]?.tcg_date || a.misc_info[0]?.ocg_date
				const dateB = b.misc_info[0]?.tcg_date || b.misc_info[0]?.ocg_date

				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

				const dateComparison = dateA.localeCompare(dateB)
				// If dates are equal, sort by name as secondary criteria
				return dateComparison === 0 ? a.name.localeCompare(b.name) : dateComparison
			})
		case ESortBy.TCG_Date_Desc:
			return cardList.sort((a, b) => {
				const dateA = a.misc_info[0]?.tcg_date || a.misc_info[0]?.ocg_date
				const dateB = b.misc_info[0]?.tcg_date || b.misc_info[0]?.ocg_date

				if (!dateA && !dateB) return a.name.localeCompare(b.name) // Sort by name when both dates missing
				if (!dateA) return 1
				if (!dateB) return -1

				const dateComparison = dateB.localeCompare(dateA)
				// If dates are equal, sort by name as secondary criteria
				return dateComparison === 0 ? a.name.localeCompare(b.name) : dateComparison
			})
		case ESortBy.ATK_Asc:
			return cardList.sort((a, b) => {
				const atkA = a.atk !== undefined ? a.atk : 9999
				const atkB = b.atk !== undefined ? b.atk : 9999

				const atkComparison = atkA - atkB
				// If ATK values are equal, sort by name as secondary criteria
				return atkComparison === 0 ? a.name.localeCompare(b.name) : atkComparison
			}) // Use -2 for cards without ATK
		case ESortBy.ATK_Desc:
			return cardList.sort((a, b) => {
				const atkA = a.atk !== undefined ? a.atk : -2
				const atkB = b.atk !== undefined ? b.atk : -2

				const atkComparison = atkB - atkA
				// If ATK values are equal, sort by name as secondary criteria
				return atkComparison === 0 ? a.name.localeCompare(b.name) : atkComparison
			})
		case ESortBy.DEF_Asc:
			return cardList.sort((a, b) => {
				const defA = a.linkval ? 9900 : a.def !== undefined ? a.def : 9999
				const defB = b.linkval ? 9900 : b.def !== undefined ? b.def : 9999

				const defComparison = defA - defB
				// If DEF values are equal, sort by name as secondary criteria
				return defComparison === 0 ? a.name.localeCompare(b.name) : defComparison
			})
		case ESortBy.DEF_Desc:
			return cardList.sort((a, b) => {
				const defA = a.linkval ? -2 : a.def !== undefined ? a.def : -3
				const defB = b.linkval ? -2 : b.def !== undefined ? b.def : -3

				const defComparison = defB - defA
				// If DEF values are equal, sort by name as secondary criteria
				return defComparison === 0 ? a.name.localeCompare(b.name) : defComparison
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
				return raceComparison === 0 ? a.name.localeCompare(b.name) : raceComparison
			})
		case ESortByPriceCM.Price_Cardmarket_Asc:
			return cardList.sort((a, b) => {
				const priceA = parseFloat(a.card_prices[0]?.cardmarket_price || '9999')
				const priceB = parseFloat(b.card_prices[0]?.cardmarket_price || '9999')
				const priceComparison = priceA - priceB
				return priceComparison === 0 ? a.name.localeCompare(b.name) : priceComparison
			})
		case ESortByPriceCM.Price_Cardmarket_Desc:
			return cardList.sort((a, b) => {
				const priceA = parseFloat(a.card_prices[0]?.cardmarket_price || '0')
				const priceB = parseFloat(b.card_prices[0]?.cardmarket_price || '0')
				const priceComparison = priceB - priceA
				return priceComparison === 0 ? a.name.localeCompare(b.name) : priceComparison
			})
		case ESortByPriceTCGP.Price_TCGPlayer_Asc:
			return cardList.sort((a, b) => {
				const priceA = parseFloat(a.card_prices[0]?.tcgplayer_price || '9999')
				const priceB = parseFloat(b.card_prices[0]?.tcgplayer_price || '9999')
				const priceComparison = priceA - priceB
				return priceComparison === 0 ? a.name.localeCompare(b.name) : priceComparison
			})
		case ESortByPriceTCGP.Price_TCGPlayer_Desc:
			return cardList.sort((a, b) => {
				const priceA = parseFloat(a.card_prices[0]?.tcgplayer_price || '0')
				const priceB = parseFloat(b.card_prices[0]?.tcgplayer_price || '0')
				const priceComparison = priceB - priceA
				return priceComparison === 0 ? a.name.localeCompare(b.name) : priceComparison
			})
		case ESortBy.Owned_Count_Desc: {
			const ownedCards = getReadyCardIds()
			return cardList.sort((a, b) => {
				const ownedA = ownedCards[a.id] ?? 0
				const ownedB = ownedCards[b.id] ?? 0
				const ownedComparison = ownedB - ownedA
				return ownedComparison === 0 ? a.name.localeCompare(b.name) : ownedComparison
			})
		}

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
