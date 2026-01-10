import {getFullCardList, _sort, ESortBy} from '@/composables/useCardSearch'
import {TBanlistFormat, TCardData} from './interfaces/YGOProInterfaces'

export async function getBanlist(format: TBanlistFormat = 'ban_tcg') {
	const cardList = _sort(ESortBy.TCG_Date_Desc, await getFullCardList())
	const banlist = {
		limited: [] as TCardData[],
		semi_limited: [] as TCardData[],
		forbidden: [] as TCardData[],
	}
	for (const card of cardList) {
		if (card.banlist_info && card.banlist_info[format]) {
			switch (card.banlist_info[format]) {
				case 'Forbidden':
					banlist.forbidden.push(card)
					break
				case 'Limited':
					banlist.limited.push(card)
					break
				case 'Semi-Limited':
					banlist.semi_limited.push(card)
					break
				default:
					break
			}
		}
	}

	return banlist
}

export function getBanlistName(format: TBanlistFormat | 'none') {
	switch (format) {
		case 'ban_tcg':
			return 'TCG'
		case 'ban_ocg':
			return 'OCG'
		case 'ban_goat':
			return 'Goat Format'
		case 'none':
			return 'No Banlist'
		default:
			return 'Unknown'
	}
}
