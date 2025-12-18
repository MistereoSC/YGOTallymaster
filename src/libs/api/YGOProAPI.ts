import {TCardData, TDBVersionData} from '../interfaces/YGOProInterfaces'

export async function fetchCardData(language: 'en' | 'de' = 'en') {
	let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
	if (language !== 'en') {
		url += `?language=${language}`
	}
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch card data: ${res.status} ${res.statusText}`
		)
	}
	const data: {data: Array<TCardData>} = await res.json()
	console.log(data)
	return data
}

export async function fetchCardSets() {
	const url = 'https://db.ygoprodeck.com/api/v7/cardsets.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch card data: ${res.status} ${res.statusText}`
		)
	}
	const data = await res.json()
	console.log(data)
	return data
}

export async function fetchCardArchetypes() {
	const url = 'https://db.ygoprodeck.com/api/v7/archetypes.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch card data: ${res.status} ${res.statusText}`
		)
	}
	const data = await res.json()
	console.log(data)
	return data
}

export async function fetchDatabaseVersion() {
	const url = 'https://db.ygoprodeck.com/api/v7/checkDBVer.php'
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(
			`Failed to fetch card data: ${res.status} ${res.statusText}`
		)
	}
	const data: Array<TDBVersionData> = await res.json()
	return data[0]
}
