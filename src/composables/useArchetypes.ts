import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ref} from 'vue'
import {ESortBy, getFullCardList, _find, _sort} from './useCardSearch'
const MIN_CARDS_IN_ARCHETYPE = 2
export enum ESortArchetypeBy {
	Name_Asc = 'Name (A-Z)',
	Name_Desc = 'Name (Z-A)',
	Card_Amount_Desc = 'Card Count (High-Low)',
	Card_Amount_Asc = 'Card Count (Low-High)',
	Release_Desc = 'Release Date (New-Old)',
	Release_Asc = 'Release Date (Old-New)',
	Renewed_Desc = 'Recent Support (New-Old)',
	Renewed_Asc = 'Recent Support (Old-New)',
}

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const archetypeList = ref([] as Array<string>)
const archetypes = ref([] as TArchetype[])
const sortedBy = ref(ESortArchetypeBy.Card_Amount_Desc)

const useArchetypes = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}

	async function _init() {
		const fullList = await getFullCardList()
		const tmpArchetypes = {} as {[key: string]: Array<TCardData>}
		for (const card of fullList) {
			if (card.archetype) {
				if (!tmpArchetypes[card.archetype]) {
					tmpArchetypes[card.archetype] = []
				}
				tmpArchetypes[card.archetype].push(card)
			}
		}
		const out: TArchetype[] = []
		let index = 0
		for (const [key, val] of Object.entries(tmpArchetypes)) {
			archetypeList.value.push(key)
			if (val.length < MIN_CARDS_IN_ARCHETYPE) continue
			const cards = _sort(ESortBy.TCG_Date_Desc, val)
			let oldestCardDate =
				cards[cards.length - 1].misc_info[0].tcg_date ??
				cards[cards.length - 1].misc_info[0].ocg_date
			const newestCardDate = cards[0].misc_info[0].tcg_date ?? cards[0].misc_info[0].ocg_date
			// Avoid Database Errors for Cards without TCG/OCG date
			if (!oldestCardDate) {
				for (let i = cards.length - 2; i >= 0; i--) {
					const date = cards[i].misc_info[0].tcg_date ?? cards[i].misc_info[0].ocg_date
					if (date) {
						oldestCardDate = date
						break
					}
				}
			}

			const newArchetype: TArchetype = {
				id: index,
				name: key,
				count: cards.length,
				cards: cards,
				preview_card: cards[0],
				newest_card_date: newestCardDate,
				oldest_card_date: oldestCardDate,
			}
			if (!oldestCardDate) {
				console.error('No Oldest Date::', cards[cards.length - 1])
			}
			if (!newestCardDate) {
				console.error('No Newest Date::', cards[0])
			}
			out.push(newArchetype)
			index++
		}
		out.sort((a, b) => (a.count === b.count ? 0 : a.count < b.count ? 1 : -1))
		archetypes.value = out
		initialized.value = 'ready'
	}

	function sort(by: ESortArchetypeBy, list?: TArchetype[]) {
		const target = list ?? archetypes.value
		if (target.length === 0) return []
		sortedBy.value = by
		const sortFn = (() => {
			switch (by) {
				case ESortArchetypeBy.Name_Asc:
					return (a: TArchetype, b: TArchetype) => a.name.localeCompare(b.name)
				case ESortArchetypeBy.Name_Desc:
					return (a: TArchetype, b: TArchetype) => b.name.localeCompare(a.name)
				case ESortArchetypeBy.Card_Amount_Asc:
					return (a: TArchetype, b: TArchetype) =>
						a.count === b.count ? 0 : a.count < b.count ? -1 : 1
				case ESortArchetypeBy.Card_Amount_Desc:
					return (a: TArchetype, b: TArchetype) =>
						a.count === b.count ? 0 : a.count < b.count ? 1 : -1
				case ESortArchetypeBy.Release_Asc:
					return (a: TArchetype, b: TArchetype) =>
						a.oldest_card_date.localeCompare(b.oldest_card_date)
				case ESortArchetypeBy.Release_Desc:
					return (a: TArchetype, b: TArchetype) =>
						b.oldest_card_date.localeCompare(a.oldest_card_date)
				case ESortArchetypeBy.Renewed_Asc:
					return (a: TArchetype, b: TArchetype) =>
						a.newest_card_date.localeCompare(b.newest_card_date)
				case ESortArchetypeBy.Renewed_Desc:
					return (a: TArchetype, b: TArchetype) =>
						b.newest_card_date.localeCompare(a.newest_card_date)
			}
		})()
		if (list) {
			return [...list].sort(sortFn)
		} else {
			return archetypes.value.sort(sortFn)
		}
	}

	return {
		archetypes,
		initialized,
		sortedBy,
		sort,
	}
}
export {useArchetypes}

export type TArchetype = {
	id: number
	name: string
	count: number
	preview_card: TCardData
	cards: Array<TCardData>

	newest_card_date: string
	oldest_card_date: string
}
