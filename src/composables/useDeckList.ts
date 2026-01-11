import {
	createDeckFile,
	getSavedDecks,
	renameDeckFile,
	saveDeckFile,
	TDeckData,
	deleteDeckFile,
} from '@/libs/Decks'
import { TCardData, TFrameType } from '@/libs/interfaces/YGOProInterfaces'
import {ref} from 'vue'

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const deckList = ref([] as Array<TDeckData>)

const useDeckList = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}
	async function _init() {
		deckList.value = await getSavedDecks()
		initialized.value = 'ready'
	}

	async function createDeck(deckName: string, deckData?: TDeckData) {
		const s = await createDeckFile(deckName, deckData)
		if (!s) throw new Error('Error while creating YDK file')
		deckList.value.push(s)
		return s
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
		saveDeck,
		deleteDeck,
		renameDeck,
	}
}

export {useDeckList}

const frameTypeSortOrder: Record<string, number> = {
	link: 0,
	xyz: 1,
	xyz_pendulum: 2,
	synchro: 3,
	synchro_pendulum: 4,
	fusion: 5,
	fusion_pendulum: 6,
	ritual: 7,
	// Other monster types will get 8
	spell: 9,
	trap: 10,
}

export function sortByDeckOrder(cards: TCardData[]) {
	return [...cards].sort((a, b) => {
		const frameOrderA = _getFrameTypeOrder(a.frameType)
		const frameOrderB = _getFrameTypeOrder(b.frameType)
		if (frameOrderA !== frameOrderB) {
			return frameOrderA - frameOrderB
		}

		const atkA = a.atk ?? -1
		const atkB = b.atk ?? -1
		if (atkA !== atkB) {
			return atkB - atkA
		}

		return a.name.localeCompare(b.name)
	})

	function _getFrameTypeOrder(frameType: TFrameType): number {
		if (frameType in frameTypeSortOrder) {
			return frameTypeSortOrder[frameType]
		}
		// All other monster frame types
		if (frameType !== 'spell' && frameType !== 'trap') {
			return 8
		}
		return frameTypeSortOrder[frameType]
	}
}
