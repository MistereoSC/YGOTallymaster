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

	async function _createSet(collectionName: string, setName: string) {
		const collection = collections.value.find((c) => c.name === collectionName)
		if (collection) {
			const set = (await createSet(setName, collectionName)) as unknown as TFullSet
			collection.sets.unshift(set)
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

	async function _renameCollection(collection: TFullCollection, newName: string) {
		const success = await renameCollection(collection.name, newName)
		if (success) {
			const idx = collections.value.findIndex((c) => c.name === collection.name)
			if (idx !== -1) {
				collections.value[idx].name = newName
			}
		}
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

export {useCardCollections, getCardListFromSet}
