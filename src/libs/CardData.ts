import {TCardData, TFrameType} from './interfaces/YGOProInterfaces'
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

export function getCardStyles(card: TCardData): TCardStyles {
	console.log('Getting styles for card:', card.name, card.frameType)

	const styles: TCardStyles = {
		vars: {
			border: '',
			desc: '',
		},
	}
	const prefix = card.frameType.split('_')[0] as TFrameType
	const suffix = card.frameType.split('_')[1] as 'pendulum' | 'undefined'
	styles.vars.border = `var(--color-card-${prefix})`
	if (suffix === 'pendulum') styles.vars.border2 = 'var(--color-card-spell)'
	styles.vars.desc = `var(--color-card-${prefix}text)`
	return styles
}
export type TCardStyles = {
	vars: {
		border: string
		border2?: string
		desc: string
	}
}
