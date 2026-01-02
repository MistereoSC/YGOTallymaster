import Files from '@/libs/Files'
import {TArchetypeData, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ref} from 'vue'
import {ESortBy, getFullCardList, _find, _sort} from './useCardSearch'
const PATH = 'data/archetypes_en.json'
const MIN_CARDS_IN_ARCHETYPE = 2

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const archetypeList = ref([] as Array<string>)
const archetypes = ref([] as TArchetypes)

const useArchetypes = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init(force = false) {
		const e = await Files.exists(PATH)
		if (!e.exists) {
			throw new Error('Archetype data file not found')
		} else {
			const data = (await Files.read(PATH)) as Array<TArchetypeData>
			archetypeList.value = []
			data.forEach((item) => {
				archetypeList.value.push(item.archetype_name)
			})
			const fullList = await getFullCardList()
			for (const [index, archetype] of archetypeList.value.entries()) {
				let cards = fullList.filter((card) => card.archetype === archetype)
				if (cards.length < MIN_CARDS_IN_ARCHETYPE) {
					archetypeList.value.splice(index, 1)
					continue
				}
				cards = _sort(ESortBy.TCG_Date_Asc, cards)
				archetypes.value.push({
					id: index,
					name: archetype,
					count: cards.length,
					cards: cards,
					preview_card: cards[0],
				})
				archetypes.value.sort((a, b) =>
					a.count === b.count ? 0 : a.count < b.count ? 1 : -1
				)
			}
		}
		initialized.value = 'ready'
	}

	return {
		archetypes,
		initialized,
	}
}
export {useArchetypes}

export type TArchetypes = {
	id: number
	name: string
	count: number
	preview_card: TCardData
	cards: Array<TCardData>
}[]
