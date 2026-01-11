<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import DeckCardGrid from '@/components/decks/DeckCardGrid.vue'
import {useCardSearch} from '@/composables/useCardSearch'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useDeckList, sortByDeckOrder} from '@/composables/useDeckList'
import {deckIdsToPopulated, ydkToJsonIds} from '@/libs/DeckParsers'
import {TDeckCardsPopulated, TDeckData} from '@/libs/Decks'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import {onBeforeUnmount, onMounted, onUnmounted, ref} from 'vue'
import DeckImportExportPanel from './DeckImportExportPanel.vue'

const props = defineProps<{
	deckData: TDeckData
}>()
const emit = defineEmits<{
	(e: 'save'): void
	(e: 'close'): void
}>()

const {settings} = useDatabaseSettings()
const {resetSearch, fullCardList, searchResults, search} = useCardSearch()
const {saveDeck} = useDeckList()
const cards = ref<TDeckCardsPopulated>({
	main: [],
	extra: [],
	side: [],
})

const loading = ref(true)

// Scroll Side Menu for Card Preview when SHIFT key is held
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

onMounted(async () => {
	resetSearch()
	cards.value = await deckIdsToPopulated(props.deckData)
	loading.value = false

	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
	window.removeEventListener('keydown', onKeyDown)
	window.removeEventListener('keyup', onKeyUp)
})

const hoveredCard = ref<null | TCardData>(null)
function onCardHover(card?: TCardData) {
	hoveredCard.value = card || null
}

function onCardAdd(card: TCardData, addToSideDeck = false) {
	switch (card.frameType) {
		case 'fusion':
		case 'fusion_pendulum':
		case 'synchro':
		case 'synchro_pendulum':
		case 'xyz':
		case 'xyz_pendulum':
		case 'link':
			if (addToSideDeck) {
				if (cards.value.side.length >= 15 || !checkDeckLimit(card.id)) return
				cards.value.side.push(card)
			} else {
				if (cards.value.extra.length >= 15 || !checkDeckLimit(card.id)) return
				cards.value.extra.push(card)
			}
			break
		default:
			if (addToSideDeck) {
				if (cards.value.side.length >= 15 || !checkDeckLimit(card.id)) return
				cards.value.side.push(card)
			} else {
				if (cards.value.main.length >= 60 || !checkDeckLimit(card.id)) return
				cards.value.main.push(card)
			}
			break
	}
}

function checkDeckLimit(cardId: number) {
	const totalCount =
		cards.value.main.filter((c) => c.id === cardId).length +
		cards.value.extra.filter((c) => c.id === cardId).length +
		cards.value.side.filter((c) => c.id === cardId).length
	return totalCount < 3
}

function onSortClick() {
	cards.value.main = sortByDeckOrder(cards.value.main)
	cards.value.extra = sortByDeckOrder(cards.value.extra)
	cards.value.side = sortByDeckOrder(cards.value.side)
}





onBeforeUnmount(async () => {
	const newDeckData = {...props.deckData}
	newDeckData.main = cards.value.main.map((c) => c.id)
	newDeckData.extra = cards.value.extra.map((c) => c.id)
	newDeckData.side = cards.value.side.map((c) => c.id)
	await saveDeck(newDeckData, props.deckData.name)
})

function onReturnClick() {
	emit('close')
}

function onCardShiftLClick(card: TCardData) {
	resetSearch()
	const searchTerm = card.archetype || card.name
	search({term: searchTerm})
}

type TTabs = 'filter' | 'export' | 'none'
const activePanel = ref<TTabs>('filter')
function toggleTab(to: TTabs) {
	if (activePanel.value === to) {
		// activePanel.value = 'none'
	} else {
		activePanel.value = to
	}
}

async function onYdkImported(ydkContent: string) {
	const imported = ydkToJsonIds(ydkContent)
	cards.value = await deckIdsToPopulated(imported)
}
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<div
			class="h-12 w-full grid grid-cols-[1fr_auto] gap-1 pl-4 pr-2 py-1 items-center bg-linear-to-r from-primary-800 via-primary-700 to-primary-800 border-b border-primary-600"
		>
			<div class="flex gap-2">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="onReturnClick"
					title="Return to Deck List"
				/>
				<h2 class="font-bold text-lg">
					{{ props.deckData.name }}
				</h2>
			</div>
			<span class="flex gap-1">
				<Button
					size="small"
					rounded
					icon="material-symbols:export-notes-rounded"
					@click="() => toggleTab('export')"
					title="Import/Export Deck"
					:class="activePanel === 'export' ? 'ring-2 ring-accent-500/50' : ''"
				/>
				<Button
					size="small"
					rounded
					icon="material-symbols:filter-alt"
					@click="() => toggleTab('filter')"
					title="Card Search"
					:class="activePanel === 'filter' ? 'ring-2 ring-accent-500/50' : ''"
				/>
				<Button
					size="small"
					rounded
					icon="material-symbols:sort-rounded"
					@click="onSortClick"
					title="Sort Deck"
				/>
			</span>
		</div>
		<div class="grid h-full grid-cols-[auto_1fr_auto] overflow-hidden" v-if="!loading">
			<div
				class="border-r border-primary-600 min-w-86 w-[25vw] max-w-132 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="p-2 h-full overflow-y-scroll scrollable" ref="cardFullViewContainer">
					<CardFullView v-if="hoveredCard" :card="hoveredCard" />
				</div>
			</div>
			<div
				class="h-full grid grid-rows-[1fr_auto_auto] overflow-hidden"
				@wheel="onDeckAreaWheel"
			>
				<div class="overflow-hidden grid grid-rows-[auto_auto_1fr] relative">
					<div class="h-full overflow-y-scroll scrollable pb-1 px-2 pt-12">
						<DeckCardGrid
							v-model="cards.main"
							@cardHover="onCardHover"
							:gray-unowned="settings?.decklistGrayUnownedGrid"
							:card-size="settings?.decklistGridCardSize || 'tiny'"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@card-shift-click="(card) => onCardShiftLClick(card)"
						/>
					</div>
					<div>
						<div
							class="absolute items-center flex top-0 left-0 right-0 px-3 py-1 bg-linear-to-r from-primary-700/95 to-primary-800/90 backdrop-blur-sm border-b border-primary-600"
						>
							<div class="flex items-center gap-2">
								<Icon
									icon="material-symbols:playing-cards-rounded"
									class="text-accent-400 text-base"
								/>
								<span class="font-semibold text-contrast-700">Main Deck</span>
								<span
									class="text-sm font-medium px-2 py-0.5 rounded-md"
									:class="
										cards.main.length > 60 || cards.main.length < 40
											? 'bg-red-500/20 text-red-400'
											: 'bg-primary-600 text-contrast-500'
									"
								>
									{{ cards.main.length }}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="border-primary-600 border-t overflow-hidden grid grid-rows-[auto_1fr]">
					<div
						class="px-3 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
					>
						<div class="flex items-center gap-2">
							<Icon
								icon="material-symbols:auto-awesome-rounded"
								class="text-secondary-400 text-base"
							/>
							<span class="font-semibold text-contrast-700">Extra Deck</span>
							<span
								class="text-sm font-medium px-2 py-0.5 rounded-md"
								:class="
									cards.extra.length > 15
										? 'bg-red-500/20 text-red-400'
										: 'bg-primary-600 text-contrast-500'
								"
							>
								{{ cards.extra.length }}
							</span>
						</div>
					</div>
					<div class="h-full overflow-y-scroll scrollable pb-1 px-2 pt-1">
						<DeckCardGrid
							v-model="cards.extra"
							@cardHover="onCardHover"
							:gray-unowned="settings?.decklistGrayUnownedGrid"
							:card-size="settings?.decklistGridCardSize || 'tiny'"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@card-shift-click="(card) => onCardShiftLClick(card)"
							:horizontal="true"
						/>
					</div>
				</div>
				<div class="border-primary-600 border-t overflow-hidden grid grid-rows-[auto_1fr]">
					<div
						class="px-3 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
					>
						<div class="flex items-center gap-2">
							<Icon
								icon="material-symbols:swap-horiz-rounded"
								class="text-tertiary-400 text-base"
							/>
							<span class="font-semibold text-contrast-700">Side Deck</span>
							<span
								class="text-sm font-medium px-2 py-0.5 rounded-md"
								:class="
									cards.side.length > 15
										? 'bg-red-500/20 text-red-400'
										: 'bg-primary-600 text-contrast-500'
								"
							>
								{{ cards.side.length }}
							</span>
						</div>
					</div>
					<div class="h-full overflow-y-scroll scrollable pb-1 px-2 pt-1">
						<DeckCardGrid
							v-model="cards.side"
							@cardHover="onCardHover"
							:gray-unowned="settings?.decklistGrayUnownedGrid"
							:card-size="settings?.decklistGridCardSize || 'tiny'"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@card-shift-click="(card) => onCardShiftLClick(card)"
							:horizontal="true"
						/>
					</div>
				</div>
			</div>
			<div
				v-if="activePanel !== 'none'"
				class="border-l border-primary-600 max-w-180 w-[30vw] bg-primary-700 h-full overflow-hidden"
			>
				<div class="h-full overflow-y-auto scrollable" v-if="activePanel === 'export'">
					<DeckImportExportPanel
						:deck-cards="cards"
						:deck-name="props.deckData.name"
						@ydk-imported="(ydk) => onYdkImported(ydk)"
					/>
				</div>
				<div
					v-else-if="activePanel === 'filter'"
					class="h-full grid grid-rows-[auto_1fr] overflow-hidden"
				>
					<div
						class="max-h-[50vh] overflow-y-scroll scrollable border-b border-primary-500 p-2 pr-1"
					>
						<CardFilter :search-while-typing="true" :show-set-filter="true" />
					</div>
					<div class="h-full overflow-y-hidden">
						<CardListVirtualList
							:card-list="searchResults == null ? fullCardList : searchResults"
							:show-limited-info="settings?.listSizeSmallList === 'tiny'"
							:show-owned-heart="true"
							:gray-unowned="settings?.grayUnownedSmallList"
							@card-hovered="(card) => onCardHover(card)"
							@card-clicked="(card) => onCardAdd(card)"
							@card-shift-clicked="(card) => onCardAdd(card, true)"
							:item-size="settings?.listSizeSmallList || 'tiny'"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
						/>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="w-full h-full grid place-items-center">
			<Spinner />
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
