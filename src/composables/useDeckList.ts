import {createDeckFile, getSavedDecks, renameDeckFile, saveDeckFile, TDeckData, deleteDeckFile} from '@/libs/Decks'
import {ref} from 'vue'
import {getFullCardList} from './useCardSearch'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const deckList = ref([] as Array<TDeckData>)

const useDeckList = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}
	async function _init(force = false) {
		deckList.value = await getSavedDecks()
		initialized.value = 'ready'
	}

	async function createDeck(deckName: string) {
		const s = await createDeckFile(deckName)
		if (!s) throw new Error('Error while creating YDK file')
		deckList.value.push(s)
		return s
	}

	async function getDeckCards(deck: TDeckData) {
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

	async function saveDeck(deck: TDeckData, renamedFrom?: string) {
		const deckNames = deckList.value.map((d) => d.name)
		// If renaming, check for name conflicts, revert to old name if conflict found
		if (renamedFrom && renamedFrom !== deck.name && deckNames.includes(deck.name)) {
			deck.name = renamedFrom
		} else if (renamedFrom && renamedFrom !== deck.name) {
			await renameDeckFile(renamedFrom, deck.name)
		}

		await saveDeckFile(deck)
		const index = deckList.value.findIndex((d) => d.name === (renamedFrom || deck.name))
		if (index !== -1) {
			deckList.value[index] = deck
		}
	}

	async function deleteDeck(deckName: string) {
		const index = deckList.value.findIndex((d) => d.name === deckName)
		if (index === -1) return
		deckList.value.splice(index, 1)
		await deleteDeckFile(deckName)
	}
	async function renameDeck(oldName: string, newName: string) {
		const index = deckList.value.findIndex((d) => d.name === oldName)
		if (index === -1) return
		deckList.value[index].name = newName
		await renameDeckFile(oldName, newName)
	}

	return {
		deckList,
		initialized,
		createDeck,
		getDeckCards,
		saveDeck,
		deleteDeck,
		renameDeck,
	}
}

export {useDeckList}
