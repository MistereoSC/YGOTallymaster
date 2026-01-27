import {
	createCollection,
	createSet,
	loadCollections,
	saveSet,
	deleteSet,
	renameAndMoveSet,
	deleteCollection,
	renameCollection,
} from '@/libs/Collections'
import {TCardSet} from '@/libs/interfaces/CardSets'
import {ref} from 'vue'
import {getFullCardList} from './useCardSearch'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'

export type TFullSet = {
	name: string
	created_at: string
	updated_at: string
	cards: TCardData[]
}
export type TFullCollection = {
	name: string
	sets: TFullSet[]
}

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const collections = ref([] as TFullCollection[])

const useCardCollections = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init() {
		const rawCollections = await loadCollections()
		const fullCollections: TFullCollection[] = []
		for (const collection of rawCollections) {
			const fullSets: TFullSet[] = []
			for (const set of collection.sets) {
				const fullCardList = await getCardListFromSet(set)
				fullSets.push({
					name: set.name!,
					created_at: set.created_at,
					updated_at: set.updated_at,
					cards: fullCardList,
				})
			}
			fullCollections.push({
				name: collection.name,
				sets: fullSets,
			})
		}
		collections.value = fullCollections
		initialized.value = 'ready'
	}

	async function _createCollection(name: string) {
		await createCollection(name)
		const newCollection = {
			name,
			sets: [] as TFullSet[],
		}
		collections.value.unshift(newCollection)
	}

	async function _createSet(collectionName: string, setName: string, setData?: TFullSet) {
		const collection = collections.value.find((c) => c.name === collectionName)
		if (collection) {
			if (!setData) {
				const set = (await createSet(setName, collectionName)) as unknown as TFullSet
				collection.sets.unshift(set)
			} else {
				await createSet(setData.name, collectionName, {
					created_at: setData.created_at,
					updated_at: setData.updated_at,
					cards: setData.cards.map((card) => card.id),
				})
				collection.sets.unshift(JSON.parse(JSON.stringify(setData)))
			}
		}
	}

	async function _saveSet(collectionName: string, set: TFullSet) {
		const newSet = {
			created_at: set.created_at,
			updated_at: new Date().toISOString(),
			cards: set.cards.map((card) => card.id),
		}
		await saveSet(set.name, collectionName, newSet)
	}

	async function _deleteSet(collectionName: string, set: TFullSet) {
		const success = await deleteSet(set.name, collectionName)
		if (success) {
			const collection = collections.value.find((c) => c.name === collectionName)
			if (collection) {
				collection.sets = collection.sets.filter((s) => s.name !== set.name)
			}
		}
	}

	async function _renameSet(collectionName: string, set: TFullSet, newName: string) {
		const success = await renameAndMoveSet(set.name, newName, collectionName)
		if (success) {
			const collection = collections.value.find((c) => c.name === collectionName)
			if (collection) {
				const setInCollection = collection.sets.find((s) => s.name === set.name)
				if (setInCollection) {
					setInCollection.name = success.name
				}
			}
		}
	}
	async function _deleteCollection(collectionName: string) {
		const success = await deleteCollection(collectionName)
		if (success) {
			collections.value = collections.value.filter((c) => c.name !== collectionName)
		}
	}

	async function _renameCollection(collectionName: string, newName: string) {
		const success = await renameCollection(collectionName, newName)
		if (success) {
			const idx = collections.value.findIndex((c) => c.name === collectionName)
			if (idx !== -1) {
				collections.value[idx].name = newName
			}
		}
	}

	async function _moveSet(setName: string, oldCollectionName: string, newCollectionName: string) {
		const success = await renameAndMoveSet(
			setName,
			setName,
			oldCollectionName,
			newCollectionName
		)
		if (success) {
			const oldCollection = collections.value.find((c) => c.name === oldCollectionName)
			const newCollection = collections.value.find((c) => c.name === newCollectionName)

			if (oldCollection && newCollection) {
				const setIndex = oldCollection.sets.findIndex((s) => s.name === setName)
				if (setIndex !== -1) {
					const set = oldCollection.sets[setIndex]
					oldCollection.sets.splice(setIndex, 1)
					newCollection.sets.unshift(set)
				}
			}
		}
	}

	/**
	 * Adds a card to an existing set within a collection.
	 * Cards are added at the end of the set.
	 * Maximum 3 copies of a card per set.
	 * @returns The number of copies added (0 if already at max)
	 */
	async function _addCardToSet(
		collectionName: string,
		setName: string,
		card: TCardData,
		copies: number = 1
	): Promise<number> {
		const collection = collections.value.find((c) => c.name === collectionName)
		if (!collection) return 0

		const set = collection.sets.find((s) => s.name === setName)
		if (!set) return 0

		// Count existing copies of this card in the set
		const existingCopies = set.cards.filter((c) => c.id === card.id).length
		const maxCopies = 3
		const availableSlots = maxCopies - existingCopies

		if (availableSlots <= 0) return 0

		// Add up to the available slots
		const copiesToAdd = Math.min(copies, availableSlots)
		for (let i = 0; i < copiesToAdd; i++) {
			set.cards.push(card)
		}

		// Save the updated set
		await _saveSet(collectionName, set)

		return copiesToAdd
	}

	/**
	 * Gets the count of a specific card in a set
	 */
	function _getCardCountInSet(collectionName: string, setName: string, cardId: number): number {
		const collection = collections.value.find((c) => c.name === collectionName)
		if (!collection) return 0

		const set = collection.sets.find((s) => s.name === setName)
		if (!set) return 0

		return set.cards.filter((c) => c.id === cardId).length
	}

	return {
		collections,
		createCollection: _createCollection,
		createSet: _createSet,
		saveSet: _saveSet,
		deleteSet: _deleteSet,
		renameSet: _renameSet,
		deleteCollection: _deleteCollection,
		renameCollection: _renameCollection,
		moveSet: _moveSet,
		addCardToSet: _addCardToSet,
		getCardCountInSet: _getCardCountInSet,
		initialized,
	}
}

async function getCardListFromSet(set: TCardSet) {
	const fullCardList = await getFullCardList()
	const cardMap = new Map(fullCardList.map((card) => [card.id, card]))
	return set.cards
		.map((id) => cardMap.get(id))
		.filter((card): card is TCardData => card !== undefined)
}

function getSetCardIds(collectionName: string, setName: string): Set<number> | null {
	const collection = collections.value.find((c) => c.name === collectionName)
	if (!collection) return null

	const set = collection.sets.find((s) => s.name === setName)
	if (!set) return null

	return new Set(set.cards.map((card) => card.id))
}
function invalidateUseCardCollections() {
	console.debug('INVALIDATE::useCardCollections')
	initialized.value = 'uninitialized'
	collections.value = []
}

export {useCardCollections, getCardListFromSet, getSetCardIds, invalidateUseCardCollections}
