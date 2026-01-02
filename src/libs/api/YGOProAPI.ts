import {
	TArchetypeData,
	TCardData,
	TDBVersionData,
	TSetItemData,
	TSetListData,
} from '../interfaces/YGOProInterfaces'

export async function fetchCardData(language: 'en' | 'de' = 'en', args?: string[]) {
	let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
	url += '?misc=yes'
	if (args && args.length > 0) {
		url += `&${args.join('&')}`
	}
	if (language !== 'en') {
		url += `&language=${language}`
	}
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch card data: ${res.status} ${res.statusText}`)
	}
	const data: {data: Array<TCardData>} = await res.json()
	return data
}

export async function fetchCardSets() {
	const url = 'https://db.ygoprodeck.com/api/v7/cardsets.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch card data: ${res.status} ${res.statusText}`)
	}
	const data: Array<TSetListData> = await res.json()
	return data
}

export async function fetchCardSetDetails(setCode: string) {
	const url = `https://db.ygoprodeck.com/api/v7/cardsetsinfo.php?setcode=${setCode}`
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch card set details: ${res.status} ${res.statusText}`)
	}
	const data: TSetItemData = await res.json()
	return data
}

export async function fetchCardArchetypes() {
	const url = 'https://db.ygoprodeck.com/api/v7/archetypes.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch card data: ${res.status} ${res.statusText}`)
	}
	const data: Array<TArchetypeData> = await res.json()
	return data
}

export async function fetchDatabaseVersion() {
	const url = 'https://db.ygoprodeck.com/api/v7/checkDBVer.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch card data: ${res.status} ${res.statusText}`)
	}
	const data: Array<TDBVersionData> = await res.json()
	return data[0]
}
