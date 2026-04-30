import {
	TYGOCDBCardsByCid,
	TYGOCDBCardRecord,
	TYGOCDBCardData,
	TYGOCDBCardsById,
} from '../interfaces/YGOCDBInterfaces'

const YGOCDB_CARDS_ZIP_URL = 'https://ygocdb.com/api/v0/cards.zip'

export async function fetchCardDataFromYGOCDB(): Promise<TYGOCDBCardsById> {
	const res = await fetch(YGOCDB_CARDS_ZIP_URL)
	if (!res.ok) {
		throw new Error(`Failed to fetch YGOCDB cards.zip: ${res.status} ${res.statusText}`)
	}

	const zipBuffer = await res.arrayBuffer()
	const jsonText = await extractSingleFileZipText(zipBuffer)
	const cardsByCid = JSON.parse(jsonText) as TYGOCDBCardsByCid

	const byId: TYGOCDBCardsById = {}
	for (const value of Object.values(cardsByCid)) {
		const normalized = normalizeYGOCDBRecord(value)
		if (!normalized) continue
		byId[normalized.id] = normalized
	}
	return byId
}

export function normalizeYGOCDBRecord(card: TYGOCDBCardRecord): TYGOCDBCardData | null {
	if (!card.id || typeof card.id !== 'number') return null

	const zhSearchNames = uniqueNonEmpty([
		card.cn_name,
		card.sc_name,
		card.md_name,
		card.nwbbs_n,
		card.cnocg_n,
		card.en_name,
	])

	const jaSearchNames = uniqueNonEmpty([card.jp_name, card.jp_ruby, card.en_name, ...zhSearchNames])

	return {
		id: card.id,
		zhName: firstNonEmpty([card.sc_name, card.cn_name, card.md_name, card.nwbbs_n]),
		jaName: firstNonEmpty([card.jp_name, card.jp_ruby]),
		zhDescription: card.text?.desc?.trim() || undefined,
		zhSearchNames,
		jaSearchNames,
	}
}

function firstNonEmpty(values: Array<string | undefined>): string | undefined {
	for (const value of values) {
		if (value && value.trim()) return value.trim()
	}
	return undefined
}

function uniqueNonEmpty(values: Array<string | undefined>): string[] {
	const seen = new Set<string>()
	const out: string[] = []
	for (const value of values) {
		const normalized = value?.trim()
		if (!normalized) continue
		if (seen.has(normalized)) continue
		seen.add(normalized)
		out.push(normalized)
	}
	return out
}

async function extractSingleFileZipText(zipBuffer: ArrayBuffer): Promise<string> {
	const bytes = new Uint8Array(zipBuffer)
	const view = new DataView(zipBuffer)

	const eocdOffset = findEOCD(bytes)
	if (eocdOffset < 0) throw new Error('Invalid ZIP: EOCD not found')

	const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true)
	if (view.getUint32(centralDirectoryOffset, true) !== 0x02014b50) {
		throw new Error('Invalid ZIP: central directory header not found')
	}

	const compressionMethod = view.getUint16(centralDirectoryOffset + 10, true)
	const compressedSize = view.getUint32(centralDirectoryOffset + 20, true)
	const localHeaderOffset = view.getUint32(centralDirectoryOffset + 42, true)

	if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
		throw new Error('Invalid ZIP: local file header not found')
	}

	const localFileNameLength = view.getUint16(localHeaderOffset + 26, true)
	const localExtraFieldLength = view.getUint16(localHeaderOffset + 28, true)
	const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength
	const compressedData = bytes.slice(dataStart, dataStart + compressedSize)

	let outputBytes: Uint8Array
	if (compressionMethod === 0) {
		outputBytes = compressedData
	} else if (compressionMethod === 8) {
		const stream = new Blob([compressedData]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
		const decompressed = await new Response(stream).arrayBuffer()
		outputBytes = new Uint8Array(decompressed)
	} else {
		throw new Error(`Unsupported ZIP compression method: ${compressionMethod}`)
	}

	return new TextDecoder('utf-8').decode(outputBytes)
}

function findEOCD(bytes: Uint8Array): number {
	// EOCD starts with 0x06054b50 and is within the last 65557 bytes of a ZIP file.
	const maxStart = Math.max(0, bytes.length - 65557)
	for (let i = bytes.length - 22; i >= maxStart; i--) {
		if (
			bytes[i] === 0x50 &&
			bytes[i + 1] === 0x4b &&
			bytes[i + 2] === 0x05 &&
			bytes[i + 3] === 0x06
		) {
			return i
		}
	}
	return -1
}
