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
