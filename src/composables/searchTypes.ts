// Shared types for card search functionality
// Extracted to avoid circular dependencies between useCardSearch and useOwnedCards

export enum ESortBy {
	Name_Asc = 'Name (Ascending)',
	Name_Desc = 'Name (Descending)',
	TCG_Date_Asc = 'TCG Date (Ascending)',
	TCG_Date_Desc = 'TCG Date (Descending)',
	Search_Score = 'Text Search Score',
	ATK_Asc = 'ATK (Ascending)',
	ATK_Desc = 'ATK (Descending)',
	DEF_Asc = 'DEF (Ascending)',
	DEF_Desc = 'DEF (Descending)',
	Type = 'Card Type',
}
