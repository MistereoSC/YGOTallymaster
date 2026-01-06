import {createCollection, createSet, loadCollections, saveSet} from '@/libs/Collections'
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
					name: set.name,
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

	async function newCollection(name: string) {
		await createCollection(name)
		const newCollection = {
			name,
			sets: [] as TFullSet[],
		}
		collections.value.unshift(newCollection)
	}

	async function newSet(collectionName: string, setName: string) {
		const collection = collections.value.find((c) => c.name === collectionName)
		if (collection) {
			const set = (await createSet(setName, collectionName)) as unknown as TFullSet
			collection.sets.unshift(set)
		}
	}

	async function _saveSet(collectionName: string, set: TFullSet) {
		const newSet = {
			name: set.name,
			created_at: set.created_at,
			updated_at: new Date().toISOString(),
			cards: set.cards.map((card) => card.id),
		}
		await saveSet(newSet, collectionName)
	}

	return {
		collections,
		createCollection: newCollection,
		createSet: newSet,
		saveSet: _saveSet,
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
