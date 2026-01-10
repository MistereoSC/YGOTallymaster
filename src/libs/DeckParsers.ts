import {getCardFromId, getFullCardList} from '@/composables/useCardSearch'
import {TDeckCardsPopulated, TDeckData} from './Decks'
import {TCardData} from './interfaces/YGOProInterfaces'

export async function exportIdsToReadableDeck(deckData: TDeckData): Promise<string> {
	let output = `Main Deck (${deckData.main.length})\n`
	output += await _stringify(deckData.main)
	output += `\nExtra Deck (${deckData.extra.length})\n`
	output += await _stringify(deckData.extra)
	output += `\nSide Deck (${deckData.side.length})\n`
	output += await _stringify(deckData.side)
	return output

	async function _stringify(cardIds: number[]): Promise<string> {
		const countMap: Record<number, number> = {}
		cardIds.forEach((cardId) => {
			if (!countMap[cardId]) countMap[cardId] = 0
			countMap[cardId]++
		})
		let sectionOutput = ''
		for (const cardId in countMap) {
			const card = await getCardFromId(Number(cardId))
			if (!card) continue
			sectionOutput += `${countMap[cardId]}x ${card.name}\n`
		}
		return sectionOutput
	}
}

export function exportPopulatedToReadableDeck(deckData: TDeckCardsPopulated): string {
	let output = `Main Deck (${deckData.main.length})\n`
	output += _stringify(deckData.main)
	output += `\nExtra Deck (${deckData.extra.length})\n`
	output += _stringify(deckData.extra)
	output += `\nSide Deck (${deckData.side.length})\n`
	output += _stringify(deckData.side)
	return output

	function _stringify(cards: TCardData[]): string {
		const countMap: Record<number, number> = {}
		cards.forEach((card) => {
			if (!countMap[card.id]) countMap[card.id] = 0
			countMap[card.id]++
		})

		let sectionOutput = ''
		for (const cardId in countMap) {
			const card = cards.find((c) => c.id === Number(cardId))
			if (!card) continue
			sectionOutput += `${countMap[cardId]}x ${card.name}\n`
		}
		return sectionOutput
	}
}

export async function exportIdsToMarketString(cardIds: number[]): Promise<string> {
	const countMap: Record<number, number> = {}
	const cardMap: Record<number, TCardData> = {}
	for (const cardId of cardIds) {
		if (!countMap[cardId]) countMap[cardId] = 0
		countMap[cardId]++
		if (!cardMap[cardId]) {
			const card = await getCardFromId(cardId)
			if (card) {
				cardMap[cardId] = card
			}
		}
	}

	let output = ''
	for (const cardId in countMap) {
		const card = cardMap[Number(cardId)]
		if (!card) continue
		output += `${countMap[cardId]}x ${card.name}\n`
	}
	return output
}

export function exportPopulatedToMarketString(cards: TCardData[]): string {
	const countMap: Record<number, number> = {}
	const cardMap: Record<number, TCardData> = {}
	for (const card of cards) {
		if (!countMap[card.id]) countMap[card.id] = 0
		countMap[card.id]++
		cardMap[card.id] = card
	}
	let output = ''
	for (const cardId in countMap) {
		const card = cardMap[Number(cardId)]
		if (!card) continue
		output += `${countMap[cardId]}x ${card.name}\n`
	}
	return output
}

export async function deckIdsToPopulated(deck: TDeckData) {
	const fullCardList = await getFullCardList()
	const out = {
		main: [] as TCardData[],
		extra: [] as TCardData[],
		side: [] as TCardData[],
	}
	for (const cardId of deck.main) {
		const card = fullCardList.find((c) => c.id === cardId)
		if (card) out.main.push(card)
	}
	for (const cardId of deck.extra) {
		const card = fullCardList.find((c) => c.id === cardId)
		if (card) out.extra.push(card)
	}
	for (const cardId of deck.side) {
		const card = fullCardList.find((c) => c.id === cardId)
		if (card) out.side.push(card)
	}
	return out
}

export function ydkToJsonIds(ydkData: string): TDeckData {
	const lines = ydkData.split('\n').map((line) => line.trim())
	const deckData: TDeckData = {
		name: '',
		main: [],
		extra: [],
		side: [],
	}

	let currentSection: 'main' | 'extra' | 'side' | null = null
	for (const line of lines) {
		if (line === '#main') {
			currentSection = 'main'
		} else if (line === '#extra') {
			currentSection = 'extra'
		} else if (line === '!side') {
			currentSection = 'side'
		} else if (line.startsWith('#')) {
			currentSection = null
			deckData.comment = line.substring(1).trim()
		} else if (currentSection) {
			const cardId = parseInt(line, 10)
			if (!isNaN(cardId)) {
				deckData[currentSection].push(cardId)
			}
		}
	}
	return deckData
}

export function jsonIdsToYdk(deckData: TDeckData): string {
	let ydkData = `${
		deckData.comment ? `#${deckData.comment}\n` : '#Created with YGO Tallymaster\n'
	}`
	ydkData += '#main\n'
	deckData.main.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	ydkData += '#extra\n'
	deckData.extra.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	ydkData += '!side\n'
	deckData.side.forEach((cardId) => {
		ydkData += `${cardId}\n`
	})
	return ydkData
}

export function validateYdkContent(ydkData: string): boolean {
	const lines = ydkData.split('\n').map((line) => line.trim())
	let hasMain = false
	let hasExtra = false
	let hasSide = false
	let currentSection: 'main' | 'extra' | 'side' | null = null
	const filteredLines = lines.filter((line) => line.length > 0)

	for (const line of filteredLines) {
		if (line === '#main') {
			currentSection = 'main'
			hasMain = true
		} else if (line === '#extra') {
			currentSection = 'extra'
			hasExtra = true
		} else if (line === '!side') {
			currentSection = 'side'
			hasSide = true
		} else if (line.startsWith('#')) {
			currentSection = null
		} else if (currentSection) {
			const cardId = parseInt(line, 10)
			if (isNaN(cardId)) {
				console.log('line is NaN::', line)

				return false
			}
		}
	}

	return hasMain || hasExtra || hasSide
}

export function importFromReadableString(readableData: string): TDeckData {
	const lines = readableData.split('\n').map((line) => line.trim())
	const deckData: TDeckData = {
		name: '',
		main: [],
		extra: [],
		side: [],
	}
	let currentSection: 'main' | 'extra' | 'side' | null = 'main'
	const filteredLines = lines.filter((line) => line.length > 0)
	for (const line of filteredLines) {
		if (line.startsWith('Main Deck')) {
			currentSection = 'main'
		} else if (line.startsWith('Extra Deck')) {
			currentSection = 'extra'
		} else if (line.startsWith('Side Deck')) {
			currentSection = 'side'
		} else if (currentSection) {
			const match = line.match(/^(\d+)x\s+(.+)$/)
			if (match) {
				const count = parseInt(match[1], 10)
				const cardName = match[2].trim()
				for (let i = 0; i < count; i++) {
					deckData[currentSection].push(cardName as unknown as number)
				}
			}
		}
	}
	return deckData
}
