export interface IMarkedCards {
	[cardId: number]: number
}

export interface IDeckList {
	main: {
		[cardId: number]: number
	}
	extra: {
		[cardId: number]: number
	}
	side: {
		[cardId: number]: number
	}

	name: string
	format: string
	creation_date: string
	preview_card_id?: number
}

export interface TCardSet {
	name: string
	created_at: string
	updated_at: string

	cards: number[]
}

export interface TCardCollection {
	name: string
	sets: TCardSet[]
}
