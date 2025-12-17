// -----------------------------------------------------------
// region Local Interfaces
// -----------------------------------------------------------
type TCardPriceData = {
	cardmarket_price: string
	tcgplayer_price: string
	ebay_price: string
	amazon_price: string
	coolstuffinc_price: string
}

type TCardImageData = {
	id: number
	image_url: string
	image_url_small: string
	image_url_cropped: string
}

type TCardSetData = {
	set_name: string
	set_code: string
	set_rarity: string
	set_rarity_code: string
	set_price: string
}

type TGeneralCardData = {
	id: number
	name: string
	frameType: TFrameType
	desc: string
	ygoprodeck_url: string

	images: TCardImageData[]
	card_sets: TCardSetData[]
	card_prices: TCardPriceData[]

	archetype?: string
}

type TMonsterCardData = {
	atk: number
	def: number
	level: number
	attribute: string
	scale: number
	linkval: number
	linkmarkers: string[]
}

type TCardDataMisc = {
	views: number
	viewsweek: number
	upvotes: number
	downvotes: number
	formats: string[]
	treated_as: string
	tcg_date: string
	ocg_date: string
	konami_id: string
	md_rarity: string
	has_effect: boolean
	genesys_points: number
}

// endregion
// -----------------------------------------------------------
// region Public Interfaces
// -----------------------------------------------------------

export type TCardData = TGeneralCardData & Partial<TMonsterCardData>

// endregion
// -----------------------------------------------------------
// region Type Definitions
// -----------------------------------------------------------
export type TFrameType =
	| 'normal'
	| 'effect'
	| 'ritual'
	| 'fusion'
	| 'synchro'
	| 'xyz'
	| 'link'
	| 'normal_pendulum'
	| 'effect_pendulum'
	| 'ritual_pendulum'
	| 'fusion_pendulum'
	| 'synchro_pendulum'
	| 'xyz_pendulum'
	| 'spell'
	| 'trap'
	| 'token'
	| 'skill'

// endregion
// -----------------------------------------------------------
