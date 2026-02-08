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
	humanReadableCardType: string
	type: string
	desc: string
	ygoprodeck_url: string
	race: string

	card_images: TCardImageData[]
	card_sets: TCardSetData[]
	card_prices: TCardPriceData[]
	banlist_info?: TBanlistInfo

	archetype?: string
	misc_info: TCardDataMisc[]
}

type TMonsterCardData = {
	atk: number
	def: number
	level: number
	attribute: TMonsterAttribute
	scale: number
	linkval: number
	linkmarkers: TLinkMarkers[]
	typeline: string[]
}

type TCardDataMisc = {
	views: number
	viewsweek: number
	upvotes: number
	downvotes: number
	formats: string[]
	treated_as?: string
	tcg_date: string
	ocg_date: string
	konami_id: number
	beta_name?: string
	md_rarity?: TMDRarity
	has_effect: number
	genesys_points?: number
	staple?: 'Yes'
	name_en?: string
}

// endregion
// -----------------------------------------------------------
// region Public Interfaces
// -----------------------------------------------------------
export type TMDRarity = 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare'
export type TCardData = TGeneralCardData & Partial<TMonsterCardData>

export type TSetListData = {
	set_name: string
	set_code: string
	num_of_cards: number
	tcg_date: string
	set_image: string
}

export type TSetItemData = {
	id: number
	name: string
	set_name: string
	set_code: string
	set_rarity: string
	set_price: string
}

export type TDBVersionData = {
	database_version: string
	last_update: string
}

// endregion
// -----------------------------------------------------------
// region Type Definitions
// -----------------------------------------------------------
export type TLinkMarkers =
	| 'Top-Left'
	| 'Top'
	| 'Top-Right'
	| 'Right'
	| 'Bottom-Right'
	| 'Bottom'
	| 'Bottom-Left'
	| 'Left'

export enum ELinkMarkers {
	TOP_LEFT = 'Top-Left',
	TOP = 'Top',
	TOP_RIGHT = 'Top-Right',
	RIGHT = 'Right',
	BOTTOM_RIGHT = 'Bottom-Right',
	BOTTOM = 'Bottom',
	BOTTOM_LEFT = 'Bottom-Left',
	LEFT = 'Left',
}

export type TMonsterType =
	| 'Normal'
	| 'Effect'
	| 'Ritual'
	| 'Fusion'
	| 'Synchro'
	| 'Xyz'
	| 'Link'
	| 'Pendulum'
	| 'Flip'
	| 'Gemini'
	| 'Toon'
	| 'Spirit'
	| 'Union'
	| 'Tuner'

export type TMonsterRace =
	| 'Spellcaster'
	| 'Dragon'
	| 'Zombie'
	| 'Warrior'
	| 'Beast-Warrior'
	| 'Beast'
	| 'Winged Beast'
	| 'Fiend'
	| 'Fairy'
	| 'Insect'
	| 'Dinosaur'
	| 'Fish'
	| 'Reptile'
	| 'Sea Serpent'
	| 'Aqua'
	| 'Pyro'
	| 'Thunder'
	| 'Rock'
	| 'Plant'
	| 'Machine'
	| 'Psychic'
	| 'Divine-Beast'
	| 'Wyrm'
	| 'Cyberse'
	| 'Illusion'

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

export type TMonsterAttribute = 'WIND' | 'FIRE' | 'WATER' | 'EARTH' | 'LIGHT' | 'DARK' | 'DIVINE'

export enum EMonsterAttributes {
	WIND = 'WIND',
	FIRE = 'FIRE',
	WATER = 'WATER',
	EARTH = 'EARTH',
	LIGHT = 'LIGHT',
	DARK = 'DARK',
	DIVINE = 'DIVINE',
}

export enum EMonsterType {
	NORMAL = 'Normal',
	EFFECT = 'Effect',
	RITUAL = 'Ritual',
	FUSION = 'Fusion',
	SYNCHRO = 'Synchro',
	XYZ = 'Xyz',
	LINK = 'Link',
	PENDULUM = 'Pendulum',
	FLIP = 'Flip',
	GEMINI = 'Gemini',
	TOON = 'Toon',
	SPIRIT = 'Spirit',
	UNION = 'Union',
	TUNER = 'Tuner',
}

export enum EMonsterRace {
	SPELLCASTER = 'Spellcaster',
	DRAGON = 'Dragon',
	ZOMBIE = 'Zombie',
	WARRIOR = 'Warrior',
	BEAST_WARRIOR = 'Beast-Warrior',
	BEAST = 'Beast',
	WINGED_BEAST = 'Winged Beast',
	FIEND = 'Fiend',
	FAIRY = 'Fairy',
	INSECT = 'Insect',
	DINOSAUR = 'Dinosaur',
	FISH = 'Fish',
	REPTILE = 'Reptile',
	SEA_SERPENT = 'Sea Serpent',
	AQUA = 'Aqua',
	PYRO = 'Pyro',
	THUNDER = 'Thunder',
	ROCK = 'Rock',
	PLANT = 'Plant',
	MACHINE = 'Machine',
	PSYCHIC = 'Psychic',
	DIVINE_BEAST = 'Divine-Beast',
	WYRM = 'Wyrm',
	CYBERSE = 'Cyberse',
	ILLUSION = 'Illusion',
}

export type TTrapTypes = 'Normal' | 'Continuous' | 'Counter'

export type TSpellTypes = 'Normal' | 'Continuous' | 'Quick-Play' | 'Field' | 'Ritual'

export type TSpellTrapAttribute = TTrapTypes | TSpellTypes

export enum ETrapTypes {
	NORMAL = 'Normal',
	CONTINUOUS = 'Continuous',
	COUNTER = 'Counter',
}
export enum ESpellTypes {
	NORMAL = 'Normal',
	CONTINUOUS = 'Continuous',
	QUICK_PLAY = 'Quick-Play',
	FIELD = 'Field',
	RITUAL = 'Ritual',
}

export type TBanlistFormat = 'ban_tcg' | 'ban_ocg' | 'ban_goat'
export type TBanlistType = 'Forbidden' | 'Limited' | 'Semi-Limited'
export type TBanlistInfo = {
	ban_tcg?: TBanlistType
	ban_ocg?: TBanlistType
	ban_goat?: TBanlistType
}

// endregion
// -----------------------------------------------------------
