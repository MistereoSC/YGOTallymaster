import {getFullCardList} from '@/composables/useCardSearch'
import Files from './Files'
import {TSetListData} from './interfaces/YGOProInterfaces'

export const RELEASES_PATH: Readonly<string> = 'data/sets_en.json'

export async function getReleases() {
	const fileExists = await Files.exists(RELEASES_PATH)
	if (!fileExists.exists) {
		console.error('Sets file does not exist.')
		return null
	}
	let data: TSetListData[] | null = await Files.read(RELEASES_PATH)
	if (!data) {
		console.error('Failed to read sets file.')
		return null
	}
	data = data.filter((set) => set.num_of_cards > 2)
	data.sort((a, b) => {
		const dateA = new Date(a.tcg_date).getTime()
		const dateB = new Date(b.tcg_date).getTime()
		return dateB - dateA
	})
	return data
}

export async function getCardsForRelease(setCode: string) {
	const cards = await getFullCardList()
	return cards.filter((card) => card.card_sets?.some((set) => set.set_code.startsWith(setCode)))
}
