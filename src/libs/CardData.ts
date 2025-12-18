import {TCardData} from './interfaces/YGOProInterfaces'
import Files from './Files'

const cardDataList: Array<TCardData> | null = null
export async function getCardList(language = 'en' as 'en' | 'de') {
	if (cardDataList) return cardDataList
	if ((await Files.exists(`data/carddata_${language}.json`)).exists) {
		const f = await Files.read<{data: Array<TCardData>}>(
			`data/carddata_${language}.json`
		)
		if (f) {
			return f.data
		} else {
			return []
		}
	} else {
		return []
	}
}
