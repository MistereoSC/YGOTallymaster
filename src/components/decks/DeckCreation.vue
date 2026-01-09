<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import DeckCardGrid from '@/components/decks/DeckCardGrid.vue'
import {useCardSearch} from '@/composables/useCardSearch'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {TCardData, TFrameType} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import {onBeforeUnmount, onMounted, onUnmounted, ref} from 'vue'

const props = defineProps<{
	deckData: TDeckData
}>()
const emit = defineEmits<{
	(e: 'save'): void
	(e: 'close'): void
}>()

const {settings} = useDatabaseSettings()
const {resetSearch, fullCardList, searchResults, search} = useCardSearch()
const {getDeckCards, saveDeck} = useDeckList()
const cards = ref<{main: TCardData[]; extra: TCardData[]; side: TCardData[]}>({
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
	cards.value = await getDeckCards(props.deckData)
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
	cards.value.main = sortForDeck(cards.value.main)
	cards.value.extra = sortForDeck(cards.value.extra)
	cards.value.side = sortForDeck(cards.value.side)
}

const frameTypeSortOrder: Record<string, number> = {
	link: 0,
	xyz: 1,
	xyz_pendulum: 2,
	synchro: 3,
	synchro_pendulum: 4,
	fusion: 5,
	fusion_pendulum: 6,
	ritual: 7,
	// Other monster types will get 8
	spell: 9,
	trap: 10,
}

function getFrameTypeOrder(frameType: TFrameType): number {
	if (frameType in frameTypeSortOrder) {
		return frameTypeSortOrder[frameType]
	}
	// All other monster frame types
	if (frameType !== 'spell' && frameType !== 'trap') {
		return 8
	}
	return frameTypeSortOrder[frameType]
}

function sortForDeck(cards: TCardData[]) {
	return [...cards].sort((a, b) => {
		const frameOrderA = getFrameTypeOrder(a.frameType)
		const frameOrderB = getFrameTypeOrder(b.frameType)
		if (frameOrderA !== frameOrderB) {
			return frameOrderA - frameOrderB
		}

		const atkA = a.atk ?? -1
		const atkB = b.atk ?? -1
		if (atkA !== atkB) {
			return atkB - atkA
		}

		return a.name.localeCompare(b.name)
	})
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
</script>

<template>
	<div class="grid h-full grid-cols-[auto_1fr_auto]" v-if="!loading">
		<div
			class="border-r border-primary-600 min-w-86 w-[25vw] max-w-132 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
		>
			<div class="grid grid-rows-[auto_1fr] overflow-hidden">
				<div
					class="h-12 w-full flex justify-between pl-4 pr-2 py-1 items-center bg-linear-to-r from-primary-800 to-primary-700 border-b border-primary-600"
				>
					<div class="font-bold text-lg truncate" :title="props.deckData.name">
						{{ props.deckData.name }}
					</div>
					<span class="flex gap-2">
						<Button
							size="small"
							rounded
							icon="material-symbols:keyboard-return-rounded"
							@click="onReturnClick"
						/>
						<Button
							size="small"
							rounded
							icon="material-symbols:sort-rounded"
							@click="onSortClick"
						/>
					</span>
				</div>
				<div class="p-2 h-full overflow-y-auto scrollable" ref="cardFullViewContainer">
					<CardFullView v-if="hoveredCard" :card="hoveredCard" />
				</div>
			</div>
		</div>
		<div class="grid grid-rows-[1fr_auto_auto] overflow-hidden" @wheel="onDeckAreaWheel">
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
						class="absolute h-12 items-center flex top-0 left-0 right-0 px-3 py-1 bg-linear-to-r from-primary-700/95 to-primary-800/90 backdrop-blur-sm border-b border-primary-600"
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
			class="border-l border-primary-600 max-w-180 w-[30vw] bg-primary-700 h-full overflow-hidden"
		>
			<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden gap">
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
</template>

<style lang="scss" scoped></style>
