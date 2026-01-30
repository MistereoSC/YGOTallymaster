// Shared types for card search functionality
// Extracted to avoid circular dependencies between useCardSearch and useOwnedCards

export enum ESortBy {
	Name_Asc = 'Name (A-Z)',
	Name_Desc = 'Name (Z-A)',
	TCG_Date_Asc = 'TCG Date (Old-New)',
	TCG_Date_Desc = 'TCG Date (New-Old)',
	ATK_Asc = 'ATK (Low-High)',
	ATK_Desc = 'ATK (High-Low)',
	DEF_Asc = 'DEF (Low-High)',
	DEF_Desc = 'DEF (High-Low)',
	Type = 'Card Type',
	Search_Score = 'Text Search Score',
}

export enum ESortByPriceCM {
	Price_Cardmarket_Asc = 'Price (Low-High) ',
	Price_Cardmarket_Desc = 'Price (High-Low) ',
}

export enum ESortByPriceTCGP {
	Price_TCGPlayer_Asc = 'Price (Low-High)',
	Price_TCGPlayer_Desc = 'Price (High-Low)',
}
