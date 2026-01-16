<script lang="ts" setup>
import {TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {onBeforeUnmount, onMounted, ref} from 'vue'
import Button from '@/components/common/Button.vue'
import {Icon} from '@iconify/vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ESortBy, _sort} from '@/composables/useCardSearch'
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
import {getOwnedCards} from '@/composables/useOwnedCards'
import {exportPopulatedToMarketString} from '@/libs/DeckParsers'
import Files from '@/libs/Files'

const {addToast} = useToast()
const {settings} = useDatabaseSettings()
const {resetSearch, fullCardList, searchResults, search, initialized} = useCardSearch()
const {saveSet} = useCardCollections()

const props = defineProps<{
	collectionName: string
	set: TFullSet
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()
onMounted(() => {
	if (props.set.cards.length > 0) {
		hoveredCard.value = props.set.cards[0]
	}
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
	resetSearch()
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
}
function onCardRemove(card: TCardData) {
	const index = props.set.cards.findIndex((c) => c.id === card.id)
	if (index !== -1) {
		props.set.cards.splice(index, 1)
	}
}

function onCardReorder(fromIndex: number, toIndex: number) {
	if (fromIndex === toIndex) return
	const [movedCard] = props.set.cards.splice(fromIndex, 1)
	props.set.cards.splice(toIndex, 0, movedCard)
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
const sortOptions = [
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
]

function sortCards(sortBy: ESortBy) {
	//@ts-ignore
	if (sortBy === 'Deck Order') {
		const sorted = sortByDeckOrder([...props.set.cards])
		props.set.cards.splice(0, props.set.cards.length, ...sorted)
		return
	}
	const sorted = _sort(sortBy, [...props.set.cards])
	props.set.cards.splice(0, props.set.cards.length, ...sorted)
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

// #endregion
// ----------------------------------------------
</script>

<template>
	<div v-if="initialized === 'ready'" class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
		<div
			class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<span class="flex gap-4 items-center">
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
								{{ collectionName }}
							</span>
						</p>
					</div>
				</div>
			</span>
			<span class="flex gap-2 items-center justify-end">
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
					/>
				</div>
			</div>
			<div class="overflow-hidden h-full">
				<div
					v-if="props.set.cards.length === 0"
					class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
				>
					<Icon icon="material-symbols:credit-card-off-rounded" class="text-4xl" />
					<p class="text-lg font-medium">No cards in this Set</p>
				</div>
				<DraggableCardListVirtualList
					v-else-if="settings?.setsDisplayAsList"
					:card-list="props.set.cards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:item-size="settings?.listSize || 'medium'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:draggable="true"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
					@reorder="onCardReorder"
				/>
				<DraggableCardListVirtualGrid
					v-else
					:card-list="props.set.cards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:item-size="settings?.gridSize || 'medium'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:draggable="true"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
					@reorder="onCardReorder"
				/>
			</div>
			<div
				class="border-l border-primary-600 max-w-180 w-[30vw] bg-primary-700 h-full overflow-hidden"
				v-if="activePanel !== 'none'"
			>
				<div
					v-if="activePanel === 'filter'"
					class="h-full grid grid-rows-[auto_1fr] overflow-hidden"
				>
					<div
						class="max-h-[50vh] overflow-y-scroll scrollable border-b border-primary-500 p-2 pr-1"
					>
						<CardFilter :search-while-typing="true" />
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
						/>
					</div>
				</div>
				<div
					v-if="activePanel === 'controls'"
					class="h-full overflow-y-auto scrollable p-3"
				>
					<div class="space-y-4">
						<!-- Sort Section -->
						<SettingsSection
							title="Sort Cards"
							icon="material-symbols:sort"
							:pt-classes="{content: 'gap-3!'}"
						>
							<button
								v-for="option in sortOptions"
								:key="option.value"
								@click="sortCards(option.value)"
								class="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg bg-primary-600 hover:bg-accent-500 text-contrast-600 hover:text-contrast-700 transition-colors"
							>
								<Icon :icon="option.icon" class="text-base opacity-70" />
								{{ option.label }}
							</button>
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
						</SettingsSection>

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
					</div>
				</div>
			</div>
		</div>
	</div>
	<div v-else class="w-full h-full grid place-items-center">
		<Spinner />
	</div>
</template>

<style lang="scss" scoped></style>
