<script lang="ts" setup>
import {TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import Button from '@/components/common/Button.vue'
import {Icon} from '@iconify/vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ESortBy, ESortByPriceCM, ESortByPriceTCGP, _sort} from '@/composables/useCardSearch'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useCardSearch} from '@/composables/useCardSearch'
import Spinner from '@/components/common/Spinner.vue'
import DraggableCardListVirtualGrid from '@/components/collections/DraggableCardListVirtualGrid.vue'
import DraggableCardListVirtualList from '@/components/collections/DraggableCardListVirtualList.vue'
import {sortByDeckOrder} from '@/composables/useDeckList'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import {useToast} from '@/composables/useToast'
import {getOwnedCards, useOwnedCards} from '@/composables/useOwnedCards'
import {exportPopulatedToMarketString} from '@/libs/DeckParsers'
import Files from '@/libs/Files'
import SetImportModal from '@/components/collections/SetImportModal.vue'

const {addToast} = useToast()
const {settings, initialized: settingsInitialized} = useDatabaseSettings()
const {resetSearch, fullCardList, searchResults, search, initialized} = useCardSearch()
const {saveSet} = useCardCollections()

// Set card search/filter
const setSearchTerm = ref('')
const selectedSort = ref('')
const filteredSetCards = computed(() => {
	if (!setSearchTerm.value.trim()) return props.set.cards
	const term = setSearchTerm.value.toLowerCase().trim()
	return props.set.cards.filter((card) => card.name.toLowerCase().includes(term))
})
const cardListReduced = computed(() => {
	const counts: Record<number, number> = {}
	for (const card of props.set.cards) {
		counts[card.id] = (counts[card.id] || 0) + 1
	}
	return counts
})

const props = defineProps<{
	collectionName: string
	set: TFullSet
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()
onBeforeMount(() => {
	resetSearch()
})
onMounted(() => {
	if (props.set.cards.length > 0) {
		hoveredCard.value = props.set.cards[0]
	}
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(async () => {
	await saveSet(props.collectionName, props.set)
	window.removeEventListener('keydown', onKeyDown)
	window.removeEventListener('keyup', onKeyUp)
})

// ----------------------------------------------
// #region Card Actions
// ----------------------------------------------

const hoveredCard = ref<null | TCardData>(null)
function onCardHover(card?: TCardData) {
	hoveredCard.value = card || null
}

function onCardAdd(card: TCardData) {
	if (props.set.cards.length >= 256) return
	const existingCopies = props.set.cards.filter((c) => c.id === card.id).length
	if (existingCopies >= 3) return

	if (existingCopies === 0) {
		props.set.cards.push(card)
	} else {
		// Find the first index of this card and insert after it
		let firstIndex = -1
		for (let i = 0; i < props.set.cards.length; i++) {
			if (props.set.cards[i].id === card.id) {
				firstIndex = i
				break
			}
		}
		props.set.cards.splice(firstIndex + 1, 0, card)
	}
	selectedSort.value = ''
}
function onCardRemove(card: TCardData) {
	const index = props.set.cards.findIndex((c) => c.id === card.id)
	if (index !== -1) {
		props.set.cards.splice(index, 1)
	}
	selectedSort.value = ''
}

function onCardReorder(fromIndex: number, toIndex: number) {
	if (fromIndex === toIndex) return
	const [movedCard] = props.set.cards.splice(fromIndex, 1)
	props.set.cards.splice(toIndex, 0, movedCard)
	selectedSort.value = ''
}

function onCardShiftLClick(card: TCardData) {
	activePanel.value = 'filter'
	resetSearch()
	const searchTerm = card.archetype || card.name
	search({term: searchTerm})
}

// #endregion
// ----------------------------------------------
// #region Controls
// ----------------------------------------------

const activePanel = ref('filter' as 'filter' | 'controls' | 'none')
function toggleFilter() {
	if (activePanel.value === 'filter') activePanel.value = 'none'
	else activePanel.value = 'filter'
}
function toggleControls() {
	if (activePanel.value === 'controls') activePanel.value = 'none'
	else activePanel.value = 'controls'
}

function onReturnClick() {
	emit('close')
}

const cardFullViewContainer = ref<HTMLElement | null>(null)
const isShiftHeld = ref(false)
function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'Shift') {
		isShiftHeld.value = true
	}
}
function onKeyUp(e: KeyboardEvent) {
	if (e.key === 'Shift') {
		isShiftHeld.value = false
	}
}
function onDeckAreaWheel(e: WheelEvent) {
	if (isShiftHeld.value && cardFullViewContainer.value) {
		e.preventDefault()
		cardFullViewContainer.value.scrollTop += e.deltaY
	}
}
// #endregion
// ----------------------------------------------
// #region Sorting and Utilities
// ----------------------------------------------
const sortOptions = ref([
	{value: ESortBy.Name_Asc, label: 'Name (A-Z)', icon: 'material-symbols:sort-by-alpha'},
	{value: ESortBy.Name_Desc, label: 'Name (Z-A)', icon: 'material-symbols:sort-by-alpha'},
	{value: ESortBy.TCG_Date_Asc, label: 'Date (Old-New)', icon: 'material-symbols:calendar-month'},
	{
		value: ESortBy.TCG_Date_Desc,
		label: 'Date (New-Old)',
		icon: 'material-symbols:calendar-month',
	},
	{value: ESortBy.ATK_Asc, label: 'ATK (Low-High)', icon: 'material-symbols:swords'},
	{value: ESortBy.ATK_Desc, label: 'ATK (High-Low)', icon: 'material-symbols:swords'},
	{value: ESortBy.DEF_Asc, label: 'DEF (Low-High)', icon: 'material-symbols:shield'},
	{value: ESortBy.DEF_Desc, label: 'DEF (High-Low)', icon: 'material-symbols:shield'},
	{value: ESortBy.Type, label: 'Card Type', icon: 'material-symbols:category'},
	{value: 'Deck Order' as ESortBy, label: 'Deck Order', icon: 'material-symbols:view-list'},
	{
		value: 'Owned Count' as ESortBy.Owned_Count_Desc,
		label: 'Owned Count',
		icon: 'material-symbols:view-list',
	},
] as Array<{value: ESortBy | ESortByPriceCM | ESortByPriceTCGP; label: string; icon: string}>)
watch(
	() => settingsInitialized.value,
	(newVal) => {
		if (newVal === 'ready')
			if (settings.value?.cardPricesVendor === 'cardmarket_price') {
				sortOptions.value.push(
					{
						value: ESortByPriceCM.Price_Cardmarket_Asc,
						label: 'Price (Low-High)',
						icon: 'tabler:currency-dollar',
					},
					{
						value: ESortByPriceCM.Price_Cardmarket_Desc,
						label: 'Price (High-Low)',
						icon: 'tabler:currency-dollar',
					}
				)
			} else if (settings.value?.cardPricesVendor === 'tcgplayer_price') {
				sortOptions.value.push(
					{
						value: ESortByPriceTCGP.Price_TCGPlayer_Asc,
						label: 'Price (Low-High)',
						icon: 'tabler:currency-dollar',
					},
					{
						value: ESortByPriceTCGP.Price_TCGPlayer_Desc,
						label: 'Price (High-Low)',
						icon: 'tabler:currency-dollar',
					}
				)
			}
	},
	{immediate: true}
)

function sortCards(sortBy: ESortBy | ESortByPriceCM | ESortByPriceTCGP | string) {
	if (!sortBy) return
	//@ts-ignore
	if (sortBy === 'Deck Order') {
		const sorted = sortByDeckOrder([...props.set.cards])
		props.set.cards.splice(0, props.set.cards.length, ...sorted)
		return
	}
	const sorted = _sort(sortBy as ESortBy, [...props.set.cards])
	props.set.cards.splice(0, props.set.cards.length, ...sorted)
}

function onSortChange(sortBy: string) {
	if (!sortBy) return
	sortCards(sortBy)
}

function removeDuplicates() {
	const seen = new Set<number>()
	const uniqueCards: TCardData[] = []
	for (const card of props.set.cards) {
		if (!seen.has(card.id)) {
			seen.add(card.id)
			uniqueCards.push(card)
		}
	}
	props.set.cards.splice(0, props.set.cards.length, ...uniqueCards)
	selectedSort.value = ''
}
// for every card in the set, add duplicates until there are 3 copies
function addDuplicates() {
	const cardCounts: Record<number, number> = {}
	// const cardsToAdd: TCardData[] = []

	for (const card of props.set.cards) {
		cardCounts[card.id] = (cardCounts[card.id] || 0) + 1
	}

	for (const cardId in cardCounts) {
		const count = cardCounts[cardId]
		const copiesToAdd = 3 - count
		if (copiesToAdd > 0) {
			const cardDataIndex = props.set.cards.findIndex((c) => c.id === parseInt(cardId))
			if (cardDataIndex !== -1) {
				for (let i = 0; i < copiesToAdd; i++) {
					// cardsToAdd.push(props.set.cards[cardDataIndex])
					props.set.cards.splice(cardDataIndex + 1, 0, props.set.cards[cardDataIndex])
				}
			}
		}
	}
	selectedSort.value = ''

	// props.set.cards.push(...cardsToAdd)
}

const {getOwned} = useOwnedCards()
function removeOwned() {
	const grayed = new Set<number>()
	const occurrenceCount: Record<number, number> = {}

	props.set.cards.forEach((card, index) => {
		const cardId = card.id
		occurrenceCount[cardId] = (occurrenceCount[cardId] || 0) + 1
		const currentOccurrence = occurrenceCount[cardId]
		const ownedCount = Math.min(getOwned(cardId), 3)
		if (3 - currentOccurrence < ownedCount) {
			grayed.add(index)
		}
	})

	const filteredCards = props.set.cards.filter((_, index) => !grayed.has(index))
	props.set.cards.splice(0, props.set.cards.length, ...filteredCards)
	selectedSort.value = ''
}

// #endregion
// ----------------------------------------------
// #region Import / Export
// ----------------------------------------------

async function exportUnowned() {
	const list = await _getUnownedMarketString()
	try {
		const fsDialogOptions = {
			filters: [{name: 'Text Files', extensions: ['txt']}],
		}
		const e = await Files.writeFileFromDialog(
			`${props.set.name}_missing.txt`,
			list,
			fsDialogOptions
		)
		if (e.success) {
			addToast('Card list exported successfully!', 'success', 3000)
		} else {
			addToast('Failed to export card list', 'error', 3000)
		}
	} catch (err) {
		console.error('Error exporting card list:', err)
		addToast('Failed to export card list', 'error', 3000)
		return
	}
}
async function clipboardUnowned() {
	try {
		const list = await _getUnownedMarketString()
		await navigator.clipboard.writeText(list)
		addToast('Card list copied to clipboard!', 'success', 3000)
	} catch (err) {
		addToast('Failed to copy unowned deck list to clipboard', 'error', 3000)
		console.error('Clipboard error:', err)
	}
}

async function exportAsText() {
	const list = exportPopulatedToMarketString(props.set.cards)
	try {
		const fsDialogOptions = {
			filters: [{name: 'Text Files', extensions: ['txt']}],
		}
		const e = await Files.writeFileFromDialog(`${props.set.name}.txt`, list, fsDialogOptions)
		if (e.success) {
			addToast('Set exported successfully!', 'success', 3000)
		} else {
			addToast('Failed to export set as .txt file', 'error', 3000)
		}
	} catch (err) {
		console.error('Error exporting set as .txt file:', err)
		addToast('Failed to export set as .txt file', 'error', 3000)
		return
	}
}
async function clipboardAsText() {
	try {
		const list = exportPopulatedToMarketString(props.set.cards)
		await navigator.clipboard.writeText(list)
		addToast('Set copied to clipboard!', 'success', 3000)
	} catch (err) {
		addToast('Failed to copy set to clipboard', 'error', 3000)
		console.error('Clipboard error:', err)
	}
}

async function _getUnownedMarketString() {
	const ownedCards = await getOwnedCards()

	// Track remaining owned count for each card as we iterate
	const remainingOwned = new Map<number, number>()

	// Build unowned cards array preserving original order
	const unownedCards: TCardData[] = []
	for (const card of props.set.cards) {
		// Initialize remaining owned count on first encounter
		if (!remainingOwned.has(card.id)) {
			remainingOwned.set(card.id, ownedCards[card.id] ?? 0)
		}

		const remaining = remainingOwned.get(card.id)!
		if (remaining > 0) {
			// This copy is owned, decrement remaining
			remainingOwned.set(card.id, remaining - 1)
		} else {
			// This copy is not owned, add to unowned list
			unownedCards.push(card)
		}
	}

	return exportPopulatedToMarketString(unownedCards)
}

const cardPrices = computed(() => {
	if (!settings.value?.cardPricesVendor || settings.value.cardPricesVendor === 'none') return 0
	return props.set.cards
		.reduce((sum, card) => {
			if (!card.misc_info[0]?.tcg_date) return sum

			const prices = card.card_prices[0]
			if (!prices) return sum
			//@ts-ignore
			const val = prices[settings.value.cardPricesVendor]
			return sum + (val ? parseFloat(val) : 0)
		}, 0)
		.toFixed(2)
})

const uniqueCardsAmount = computed(() => {
	const uniqueIds = new Set(props.set.cards.map((c) => c.id))
	return uniqueIds.size
})

// Paste Card List Modal
const showPasteModal = ref(false)
function onPasteImportApply(importedCards: TCardData[]) {
	// Add cards to the set while grouping same cards together
	for (const card of importedCards) {
		// Find the last index of this card in the set
		let lastIndex = -1
		for (let i = props.set.cards.length - 1; i >= 0; i--) {
			if (props.set.cards[i].id === card.id) {
				lastIndex = i
				break
			}
		}
		if (lastIndex !== -1) {
			// Insert after the last occurrence
			props.set.cards.splice(lastIndex + 1, 0, card)
		} else {
			// No existing copy, add to the end
			props.set.cards.push(card)
		}
	}
	showPasteModal.value = false
	selectedSort.value = ''
	addToast(`Added ${importedCards.length} cards to set`, 'success', 3000)
}
// #endregion
// ----------------------------------------------

function onLinkClick(name: string) {
	resetSearch()
	search({term: name})
}
</script>

<template>
	<div v-if="initialized === 'ready'" class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
		<!-- Header -->
		<div
			class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<span class="flex gap-4 items-center justify-start">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="onReturnClick"
					v-tooltip.bottom="'Return'"
				/>

				<div class="flex gap-3 items-center">
					<div class="flex flex-col">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
							{{ props.set.name }}
						</h2>
						<p class="text-xs text-contrast-500">
							<span class="font-medium">
								{{ collectionName }} - {{ props.set.cards.length }} cards -
								{{ uniqueCardsAmount }}
								unique
								<span
									v-if="
										settings?.cardPricesVendor &&
										settings?.cardPricesVendor !== 'none'
									"
								>
									- ${{ cardPrices }}
								</span>
							</span>
						</p>
					</div>
				</div>
			</span>
			<span class="flex gap-2 items-center justify-center">
				<!-- Search Field -->
				<div class="relative flex-1 max-w-xs">
					<Icon
						icon="material-symbols:search-rounded"
						class="absolute left-2.5 top-1/2 -translate-y-1/2 text-contrast-500 text-lg"
					/>
					<input
						v-model="setSearchTerm"
						type="text"
						placeholder="Search in set..."
						class="w-full bg-primary-800 text-contrast-700 placeholder-contrast-500 rounded-md pl-9 pr-8 py-1.5 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors"
					/>
					<button
						v-if="setSearchTerm"
						@click="setSearchTerm = ''"
						class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
					>
						<Icon icon="material-symbols:close-rounded" class="text-lg" />
					</button>
				</div>

				<!-- Sort Dropdown -->
				<div class="relative">
					<select
						v-model="selectedSort"
						@change="onSortChange(selectedSort)"
						class="bg-primary-800 text-contrast-700 rounded-md px-3 py-1.5 pr-8 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors appearance-none cursor-pointer"
					>
						<option value="" disabled>Sort List</option>
						<option
							v-for="option in sortOptions"
							:key="option.value"
							:value="option.value"
						>
							{{ option.label }}
						</option>
					</select>
					<Icon
						icon="material-symbols:arrow-drop-down-rounded"
						class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 pointer-events-none text-xl"
					/>
				</div>

				<span class="h-8 w-px full bg-gray-600 mr-1 ml-2"></span>

				<Button
					rounded
					size="small"
					icon="material-symbols:tune"
					@click="toggleControls"
					:class="activePanel === 'controls' ? 'ring-2 ring-accent-500/50' : ''"
					v-tooltip.bottom="'Utilities'"
				/>
				<Button
					rounded
					size="small"
					icon="material-symbols:filter-alt"
					@click="toggleFilter"
					:class="activePanel === 'filter' ? 'ring-2 ring-accent-500/50' : ''"
					v-tooltip.bottom="'Card Search'"
				/>
			</span>
		</div>
		<div class="grid h-full grid-cols-[auto_1fr_auto] overflow-hidden" @wheel="onDeckAreaWheel">
			<div
				class="border-r border-primary-600 min-w-86 w-[25vw] max-w-132 bg-primary-700 grid h-full overflow-hidden"
			>
				<div class="p-2 h-full overflow-y-auto scrollable" ref="cardFullViewContainer">
					<CardFullView
						v-if="hoveredCard"
						:card="hoveredCard"
						:description-highlighting="settings?.descriptionHighlighting"
						:show-banlist-for="settings?.showBanlistFor || 'none'"
						:show-card-prices="settings?.cardPricesVendor !== 'none'"
						:show-release-info="settings?.showDescriptionReleases"
						:show-add-remove-buttons="true"
						@add-card="(card) => onCardAdd(card)"
						@remove-card="(card) => onCardRemove(card)"
						:link-highlighting="true"
						@link-click="(name) => onLinkClick(name)"
					/>

					<div class="h-full grid place-items-center p-6" v-else>
						<div
							class="flex items-center gap-2 border rounded-lg p-2 border-primary-500"
						>
							<Icon
								icon="material-symbols:info-rounded"
								class="text-3xl text-accent-300"
							/>
							<span class="text-sm text-primary-400 leading-none italic">
								Select a card to view details or use the filter to narrow down
								results.
							</span>
						</div>
					</div>
				</div>
			</div>
			<div class="overflow-hidden h-full">
				<div
					v-if="filteredSetCards.length === 0"
					class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
				>
					<Icon icon="material-symbols:credit-card-off-rounded" class="text-4xl" />
					<p class="text-lg font-medium">
						{{ setSearchTerm ? 'No matching cards' : 'No cards in this Set' }}
					</p>
				</div>
				<DraggableCardListVirtualList
					v-else-if="settings?.setsDisplayAsList"
					:card-list="filteredSetCards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:gray-unowned-reverse="settings?.setsGrayUnownedGridReverse"
					:item-size="settings?.listSize || 'medium'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:draggable="true"
					:show-owned-heart="settings?.setsShowOwnedHeart"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
					@reorder="onCardReorder"
				/>
				<DraggableCardListVirtualGrid
					v-else
					:card-list="filteredSetCards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:gray-unowned-reverse="settings?.setsGrayUnownedGridReverse"
					:item-size="settings?.gridSize || 'medium'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:draggable="true"
					:show-owned-heart="settings?.setsShowOwnedHeart"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
					@reorder="onCardReorder"
					:show-md-rarity="settings?.displayMDRarity"
				/>
			</div>
			<div
				class="border-l border-primary-600 max-w-150 w-[30vw] bg-primary-700 h-full overflow-hidden"
				v-if="activePanel !== 'none'"
			>
				<div
					v-if="activePanel === 'filter'"
					class="h-full grid grid-rows-[auto_1fr] overflow-hidden"
				>
					<div
						class="max-h-[50vh] overflow-y-scroll scrollable border-b border-primary-500 p-2 pr-1"
					>
						<CardFilter
							:search-while-typing="true"
							:show-set-filter="true"
							:show-staples-toggle="settings?.showStaplesSlider"
						/>
					</div>
					<div class="h-full overflow-hidden">
						<CardListVirtualList
							:card-list="searchResults == null ? fullCardList : searchResults"
							:show-limited-info="settings?.listSizeSmallList === 'tiny'"
							:show-owned-heart="true"
							:gray-unowned="settings?.grayUnownedSmallList"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@card-hovered="(card) => onCardHover(card)"
							@card-clicked="(card) => onCardAdd(card)"
							:item-size="settings?.listSizeSmallList || 'tiny'"
							:show-card-context-menu="true"
							:pip-list="cardListReduced"
						/>
					</div>
				</div>
				<div
					v-if="activePanel === 'controls'"
					class="h-full overflow-y-auto scrollable p-3"
				>
					<div class="space-y-4">
						<!-- Import/Export Section -->
						<SettingsSection title="Export" icon="tabler:package-export">
							<SettingsItem
								icon="tabler:file-text-filled"
								title="Export as Text"
								class="cursor-pointer"
								description="Export set as readable .txt file"
								@click="() => exportAsText()"
							/>
							<SettingsItem
								icon="tabler:clipboard-list-filled"
								title="Clipboard as Text"
								class="cursor-pointer"
								description="Copy set to clipboard"
								@click="() => clipboardAsText()"
							/>
							<SettingsItem
								icon="tabler:heart-broken-filled"
								title="Export Unowned List"
								class="cursor-pointer"
								description="Export unowned cards as readable .txt file"
								@click="() => exportUnowned()"
							/>
							<SettingsItem
								icon="tabler:clipboard-list-filled"
								title="Clipboard Unowned List"
								class="cursor-pointer"
								description="Copy unowned cards list to clipboard"
								@click="() => clipboardUnowned()"
							/>
						</SettingsSection>
						<SettingsSection title="Import" icon="tabler:package-import">
							<SettingsItem
								icon="tabler:file-import"
								title="Paste card list"
								description="Paste card list in readable format."
								class="cursor-pointer"
								@click="() => (showPasteModal = true)"
							/>
						</SettingsSection>

						<!-- Utilities Section -->
						<SettingsSection title="Utilities" icon="material-symbols:build">
							<SettingsItem
								icon="material-symbols:file-copy-off-rounded"
								title="Remove Duplicates"
								class="cursor-pointer hover:bg-red-900"
								description="Remove duplicate cards from the set"
								icon-color-class="text-red-400"
								@click="() => removeDuplicates()"
							/>
							<SettingsItem
								icon="material-symbols:file-copy-rounded"
								title="Add Duplicates"
								class="cursor-pointer hover:bg-red-900"
								description="Add duplicate cards to the set until there are 3 copies of each"
								icon-color-class="text-red-400"
								@click="() => addDuplicates()"
							/>
							<SettingsItem
								icon="material-symbols:file-copy-off-rounded"
								title="Remove Owned"
								class="cursor-pointer hover:bg-red-900"
								description="Remove cards that are already owned from the set"
								icon-color-class="text-red-400"
								@click="() => removeOwned()"
							/>
						</SettingsSection>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div v-else class="w-full h-full grid place-items-center">
		<Spinner />
	</div>

	<!-- Paste Card List Modal -->
	<SetImportModal
		:open="showPasteModal"
		:existing-cards="props.set.cards"
		@cancel="showPasteModal = false"
		@apply="onPasteImportApply"
	/>
</template>

<style lang="scss" scoped></style>
