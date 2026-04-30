import {TCardData, TFrameType} from './interfaces/YGOProInterfaces'
import Files from './Files'
import {TLanguageCodes} from './interfaces/Localization'

export async function getCardList(language = 'en' as TLanguageCodes) {
	console.debug(`CardData::getCardList::Loading card data for language: ${language}`)
	const cards = await readCardDataFile(language)
	if (cards.length > 0) return cards

	if (language !== 'en') {
		console.warn(
			`CardData::getCardList::Missing or invalid carddata_${language}.json. Falling back to English card data.`
		)
		return await readCardDataFile('en')
	}
	return []
}

async function readCardDataFile(language: TLanguageCodes): Promise<TCardData[]> {
	const path = `data/carddata_${language}.json`
	if (!(await Files.exists(path)).exists) return []
	const fileContent = await Files.read<{data: Array<TCardData>}>(path)
	if (!fileContent || !Array.isArray(fileContent.data)) return []
	return fileContent.data
}

export function getCardStyles(card: TCardData): TCardStyles {
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
