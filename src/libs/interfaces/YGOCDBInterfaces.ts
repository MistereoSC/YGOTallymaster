export type TYGOCDBCardText = {
	types?: string
	pdesc?: string
	desc?: string
}

export type TYGOCDBCardRecord = {
	id: number
	cn_name?: string
	sc_name?: string
	md_name?: string
	nwbbs_n?: string
	cnocg_n?: string
	jp_name?: string
	jp_ruby?: string
	en_name?: string
	text?: TYGOCDBCardText
}

export type TYGOCDBCardsByCid = Record<string, TYGOCDBCardRecord>

export type TYGOCDBCardData = {
	id: number
	zhName?: string
	jaName?: string
	zhDescription?: string
	zhSearchNames: string[]
	jaSearchNames: string[]
}

export type TYGOCDBCardsById = Record<number, TYGOCDBCardData>
