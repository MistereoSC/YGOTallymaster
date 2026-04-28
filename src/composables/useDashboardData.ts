import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {useDatabaseSettings} from './useDatabaseSettings'
import {useOwnedCards} from './useOwnedCards'
import {TVendor} from '@/libs/interfaces/CardSets'
import {EMonsterRace} from '@/libs/interfaces/YGOProInterfaces'

const {settings} = useDatabaseSettings()
const {ownedCards, ownedCardList} = useOwnedCards()

// ────────────────────────────────────────────────────────────────────────────
// #region Core Counts
// ────────────────────────────────────────────────────────────────────────────

export function getTotalOwned() {
	if (!ownedCards.value) return 0
	return Object.values(ownedCards.value).reduce((sum, n) => sum + n, 0)
}

export function getUniqueOwned() {
	return ownedCardList.value.length
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Prices
// ────────────────────────────────────────────────────────────────────────────

export function getTotalPrice() {
	const vendor = settings.value?.cardPricesVendor ?? 'none'
	if (!ownedCards.value || vendor === 'none') return null
	let sum = 0
	for (const card of ownedCardList.value) {
		const qty = ownedCards.value[card.id] ?? 0
		sum += _cardPrice(card, vendor) * qty
	}
	return sum
}

function _cardPrice(card: TCardData, vendor: TVendor): number {
	if (vendor === 'none') return 0
	const prices = card.card_prices?.[0]
	if (!prices) return 0
	const raw = prices[vendor]
	return parseFloat(raw) || 0
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Card Type Breakdown
// ────────────────────────────────────────────────────────────────────────────

export function getTotalCardTypeBreakdown() {
	const counts = {monster: 0, spell: 0, trap: 0}
	for (const card of ownedCardList.value) {
		const cat = _frameCategory(card)
		const amt = ownedCards.value?.[card.id] ?? 0
		if (cat === 'monster') counts.monster += amt
		else if (cat === 'spell') counts.spell += amt
		else if (cat === 'trap') counts.trap += amt
	}
	return counts
}

const MONSTER_TYPES = ['Effect', 'Normal', 'Ritual', 'Fusion', 'Synchro', 'Xyz', 'Link'] as const
export function getTotalMonsterTypeBreakdown() {
	const counts: Record<string, number> = {}
	for (const type of MONSTER_TYPES) counts[type] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'monster') continue
		const type = _monsterType(card)
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[type] = (counts[type] ?? 0) + amt
	}
	return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export function getTotalPendulumCount() {
	let count = 0
	for (const card of ownedCardList.value) {
		if (_isPendulum(card)) {
			const amt = ownedCards.value?.[card.id] ?? 0
			count += amt
		}
	}
	return count
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Frame-type helpers
// ────────────────────────────────────────────────────────────────────────────

function _frameCategory(card: TCardData): 'monster' | 'spell' | 'trap' | 'token' | 'other' {
	const f = card.frameType
	if (f === 'spell') return 'spell'
	if (f === 'trap') return 'trap'
	if (f === 'token') return 'token'
	if (
		[
			'normal',
			'effect',
			'ritual',
			'fusion',
			'synchro',
			'xyz',
			'link',
			'normal_pendulum',
			'effect_pendulum',
			'ritual_pendulum',
			'fusion_pendulum',
			'synchro_pendulum',
			'xyz_pendulum',
			'skill',
		].includes(f)
	)
		return 'monster'
	return 'other'
}

// Primary monster type from frameType (pendulums resolve to their base type)
function _monsterType(card: TCardData): string {
	const f = card.frameType
	if (f === 'effect' || f === 'effect_pendulum') return 'Effect'
	if (f === 'normal' || f === 'normal_pendulum') return 'Normal'
	if (f === 'ritual' || f === 'ritual_pendulum') return 'Ritual'
	if (f === 'fusion' || f === 'fusion_pendulum') return 'Fusion'
	if (f === 'synchro' || f === 'synchro_pendulum') return 'Synchro'
	if (f === 'xyz' || f === 'xyz_pendulum') return 'Xyz'
	if (f === 'link') return 'Link'
	if (f === 'skill') return 'Skill'
	return 'Other'
}

function _isPendulum(card: TCardData): boolean {
	return card.frameType?.includes('pendulum') ?? false
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Attribute Breakdown
// ────────────────────────────────────────────────────────────────────────────

const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'] as const
export function getTotalAttributeBreakdown() {
	const counts: Record<string, number> = {}
	for (const attr of ATTRIBUTES) counts[attr] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'monster' || !card.attribute) continue
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[card.attribute] = (counts[card.attribute] ?? 0) + amt
	}
	return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Race/Type Breakdown
// ────────────────────────────────────────────────────────────────────────────

export function getTotalRaceRanking() {
	const MONSTER_RACES = Object.values(EMonsterRace)
	const counts: Record<string, number> = {}
	for (const race of MONSTER_RACES) counts[race] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'monster' || !card.race) continue
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[card.race] = (counts[card.race] ?? 0) + amt
	}
	return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Archetype Breakdown
// ────────────────────────────────────────────────────────────────────────────

export function getTotalArchetypeRanking() {
	const counts: Record<string, number> = {}
	for (const card of ownedCardList.value) {
		const amt = ownedCards.value?.[card.id] ?? 0
		if (!card.archetype) continue
		counts[card.archetype] = (counts[card.archetype] ?? 0) + amt
	}
	return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Level / Rank Distribution
// ────────────────────────────────────────────────────────────────────────────

export function getLevelDistribution() {
	const counts: Record<number, number> = {}
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'monster') continue
		if (card.frameType === 'link') continue // links have linkval not level
		const lvl = card.level
		if (lvl == null) continue
		counts[lvl] = (counts[lvl] ?? 0) + 1
	}
	return Object.entries(counts)
		.sort((a, b) => Number(a[0]) - Number(b[0]))
		.map(([lvl, count]) => ({lvl: Number(lvl), count}))
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region MD Rarity
// ────────────────────────────────────────────────────────────────────────────

export function getMDRarityBreakdown() {
	const counts: Record<string, number> = {
		'Ultra Rare': 0,
		'Super Rare': 0,
		Rare: 0,
		Common: 0,
		'(None)': 0,
	}
	for (const card of ownedCardList.value) {
		const rarity = card.misc_info?.[0]?.md_rarity
		if (rarity) {
			counts[rarity] = (counts[rarity] ?? 0) + 1
		} else {
			counts['(None)']++
		}
	}
	return Object.entries(counts).filter(([, v]) => v > 0)
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Banlist Status Breakdown
// ────────────────────────────────────────────────────────────────────────────

export function getTotalBanlistBreakdown(format: TBanlistFormat) {
	const counts = {forbidden: 0, limited: 0, semiLimited: 0, unlimited: 0}
	for (const card of ownedCardList.value) {
		const amt = ownedCards.value?.[card.id] ?? 0
		if (!amt) continue
		const status = card.banlist_info?.[format]
		if (status === 'Forbidden') counts.forbidden += amt
		else if (status === 'Limited') counts.limited += amt
		else if (status === 'Semi-Limited') counts.semiLimited += amt
		else counts.unlimited += amt
	}
	return counts
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Price Distribution
// ────────────────────────────────────────────────────────────────────────────

export type TPriceBucket = {label: string; min: number; max: number; count: number}

export function getPriceDistribution(): {buckets: TPriceBucket[]; vendor: TVendor} | null {
	const vendor = settings.value?.cardPricesVendor ?? 'none'
	if (vendor === 'none') return null
	const buckets: TPriceBucket[] = [
		{label: '< $0.10', min: 0, max: 0.1, count: 0},
		{label: '$0.10 – $0.50', min: 0.1, max: 0.5, count: 0},
		{label: '$0.50 – $2', min: 0.5, max: 2, count: 0},
		{label: '$2 – $10', min: 2, max: 10, count: 0},
		{label: '> $10', min: 10, max: Infinity, count: 0},
	]
	for (const card of ownedCardList.value) {
		const qty = ownedCards.value?.[card.id] ?? 0
		if (!qty) continue
		const price = _cardPrice(card, vendor)
		for (const bucket of buckets) {
			if (price >= bucket.min && price < bucket.max) {
				bucket.count += qty
				break
			}
		}
	}
	return {buckets, vendor}
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Monster Subtype Breakdown
// ────────────────────────────────────────────────────────────────────────────

const MONSTER_SUBTYPES = ['Tuner', 'Flip', 'Toon', 'Spirit', 'Union', 'Gemini'] as const
export function getTotalMonsterSubtypeBreakdown() {
	const counts: Record<string, number> = {}
	for (const sub of MONSTER_SUBTYPES) counts[sub] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'monster') continue
		const amt = ownedCards.value?.[card.id] ?? 0
		if (!amt || !card.typeline) continue
		for (const sub of MONSTER_SUBTYPES) {
			if (card.typeline.includes(sub)) {
				counts[sub] += amt
			}
		}
	}
	return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Release Date Breakdown
// ────────────────────────────────────────────────────────────────────────────

export function getTotalTCGReleaseYearBreakdown() {
	const counts: Record<string, number> = {}
	let earliestYear = new Date().getFullYear()
	let latestYear = 0
	for (const card of ownedCardList.value) {
		const dateStr = card.misc_info?.[0]?.tcg_date
		let year: string
		if (dateStr) {
			year = dateStr.slice(0, 4)
			const yearNum = Number(year)
			if (yearNum < earliestYear) earliestYear = yearNum
			if (yearNum > latestYear) latestYear = yearNum
		} else {
			year = 'Unreleased'
		}
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[year] = (counts[year] ?? 0) + amt
	}
	// Fill in empty years
	for (let y = earliestYear; y <= latestYear; y++) {
		const yearStr = String(y)
		if (!counts[yearStr]) counts[yearStr] = 0
	}
	return Object.entries(counts)
		.sort((a, b) => {
			if (a[0] === 'Unreleased') return 1
			if (b[0] === 'Unreleased') return -1
			return Number(a[0]) - Number(b[0])
		})
		.map(([year, count]) => ({year, count}))
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Card Showcase
// ────────────────────────────────────────────────────────────────────────────

export function getMostOwnedCards(n = 10) {
	const counts: [TCardData, number][] = ownedCardList.value.map((card) => {
		const amt = ownedCards.value?.[card.id] ?? 0
		return [card, amt]
	})
	return counts.sort((a, b) => b[1] - a[1]).slice(0, n)
}

export function getMostValuableCards(n = 10) {
	const vendor = settings.value?.cardPricesVendor ?? 'none'
	if (vendor === 'none') return []
	const counts: [TCardData, number][] = ownedCardList.value.map((card) => {
		const price = _cardPrice(card, vendor)
		// const qty = ownedCards.value?.[card.id] ?? 0
		return [card, price]
	})
	return counts.sort((a, b) => b[1] - a[1]).slice(0, n)
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
// #region Spell and Trap Card Types
// ────────────────────────────────────────────────────────────────────────────

const SPELL_TYPES = ['Normal', 'Quick-Play', 'Continuous', 'Field', 'Equip', 'Ritual'] as const
export function getTotalSpellTypeBreakdown() {
	const counts: Record<string, number> = {}
	for (const sub of SPELL_TYPES) counts[sub] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'spell') continue
		const t = card.race
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[t] = (counts[t] ?? 0) + amt
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.map(([type, count]) => ({type, count}))
}

const TRAP_TYPES = ['Normal', 'Continuous', 'Counter'] as const
export function getTotalTrapTypeBreakdown() {
	const counts: Record<string, number> = {}
	for (const sub of TRAP_TYPES) counts[sub] = 0
	for (const card of ownedCardList.value) {
		if (_frameCategory(card) !== 'trap') continue
		const t = card.race
		const amt = ownedCards.value?.[card.id] ?? 0
		counts[t] = (counts[t] ?? 0) + amt
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.map(([type, count]) => ({type, count}))
}

// #endregion
// ────────────────────────────────────────────────────────────────────────────
