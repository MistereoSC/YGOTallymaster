import {DATA} from '../files/LocalData'

export async function updateCoreData(language: 'en' | 'de' = 'en') {
	const url =
		'https://db.ygoprodeck.com/api/v7/cardinfo.php' + '?lang=' + language
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch card data: ${res.status} ${res.statusText}`
		)
	}

	const data = await res.json()
	console.log(data)
	await DATA.api.core.write(data, language)
	return data
}
export async function readCoreData(
	language: 'en' | 'de' = 'en'
): Promise<any | null> {
	const exists = await DATA.api.core.exists(language)
	if (!exists) return null
	const data = await DATA.api.core.read(language)
	return data
}
