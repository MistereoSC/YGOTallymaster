<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import DeckCardGrid from '@/components/decks/DeckCardGrid.vue'
import DeckDisplaySettings from '@/components/decks/DeckDisplaySettings.vue'
import {useCardSearch} from '@/composables/useCardSearch'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {RUnsafePathCharactersRegex} from '@/libs/Files'
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
	settingsToggled.value = false
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
	newDeckData.name = nameContent.value.trim() || props.deckData.name

	await saveDeck(newDeckData, props.deckData.name)
})

const settingsToggled = ref(false)
function toggleSettings() {
	settingsToggled.value = !settingsToggled.value
}

const nameContent = ref(props.deckData.name)

function onNameInput(event: Event) {
	const input = event.target as HTMLInputElement
	const sanitized = input.value.replace(RUnsafePathCharactersRegex, '')
	if (sanitized !== input.value) {
		nameContent.value = sanitized
		input.value = sanitized
	}
}

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
			class="min-w-86 w-[25vw] max-w-132 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
		>
			<div class="grid grid-rows-[auto_1fr] overflow-hidden">
				<div class="bg-primary-600 flex items-center justify-between py-1 px-2 gap-2">
					<div class="flex items-center">
						<Icon
							icon="material-symbols:edit-square-rounded"
							class="text-contrast-300 mr-1"
						/>
						<input
							type="text"
							class="font-bold truncate :placeholder:text-contrast-500 focus:outline-none w-full border border-transparent focus:border-b-accent-500"
							v-model="nameContent"
							maxlength="32"
							placeholder="Deck Name"
							@input="onNameInput"
						/>
					</div>
					<span class="flex gap-2">
						<Button
							size="small"
							rounded
							icon="material-symbols:keyboard-return-rounded"
							@click="onReturnClick"
						/>
						<Button
							rounded
							size="small"
							icon="material-symbols:settings-rounded"
							@click="toggleSettings"
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
					<div v-if="settingsToggled" class="flex flex-col gap-4">
						<!-- <div class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col">
							<Button
								size="small"
								icon="material-symbols:sort-rounded"
								label="Sort Deck"
								@click="onSortClick"
							/>
							<div class="flex gap-2 w-full">
								<Button
									class="grow"
									size="small"
									icon="material-symbols:sort-rounded"
									label="Import Deck"
								/>
								<Button
									class="grow"
									size="small"
									icon="material-symbols:sort-rounded"
									label="Export Deck"
								/>
							</div>
							<Button
								size="small"
								icon="material-symbols:sort-rounded"
								label="Export Unowned Cards List"
							/>
						</div> -->

						<DeckDisplaySettings />
					</div>
					<CardFullView v-else-if="hoveredCard" :card="hoveredCard" />
				</div>
			</div>
		</div>
		<div class="grid grid-rows-[1fr_auto_auto] overflow-hidden" @wheel="onDeckAreaWheel">
			<div class="overflow-hidden grid grid-rows-[auto_auto_1fr] relative">
				<div class="h-full overflow-y-scroll scrollable pb-1 px-2 pt-10">
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
					<h3
						class="text-xl font-bold absolute top-0 left-0 right-2 pl-4 bg-primary-800/70"
					>
						<span>Main Deck</span>
						<span
							class="text-contrast-600 pl-8 font-semibold"
							:class="{
								'text-red-400': cards.main.length > 60 || cards.main.length < 40,
							}"
							>[{{ cards.main.length }}]
						</span>
					</h3>
				</div>
			</div>
			<div
				class="border-primary-500 border-t-2 overflow-hidden grid grid-rows-[auto_auto_1fr]"
			>
				<h3 class="text-xl font-bold pl-4 pt-1">
					<span>Extra Deck</span>
					<span
						class="text-contrast-600 pl-8 font-semibold"
						:class="{'text-red-400': cards.extra.length > 15}"
						>[{{ cards.extra.length }}]
					</span>
				</h3>
				<div class="h-full overflow-y-scroll scrollable pb-1 px-2">
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
			<div
				class="border-primary-500 border-t-2 overflow-hidden grid grid-rows-[auto_auto_1fr]"
			>
				<h3 class="text-xl font-bold pl-4 pt-1">
					<span>Side Deck</span>
					<span
						class="text-contrast-600 pl-8 font-semibold"
						:class="{'text-red-400': cards.side.length > 15}"
						>[{{ cards.side.length }}]
					</span>
				</h3>
				<div class="h-full overflow-y-scroll scrollable pb-1 px-2">
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
			class="max-w-180 w-[30vw] bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
		>
			<div class="h-full grid grid-rows-[auto_auto] overflow-hidden gap">
				<div class="overflow-y-scroll scrollable border-b-2 border-b-primary-400 p-2">
					<CardFilter :search-while-typing="true" />
				</div>
				<div class="h-full overflow-y-scroll scrollable">
					<CardListVirtualList
						:card-list="searchResults == null ? fullCardList : searchResults"
						:show-limited-info="settings?.decklistListSize === 'tiny'"
						:show-owned-number="true"
						:show-owned-heart="settings?.decklistShowOwnedHeartList"
						:gray-unowned="settings?.decklistGrayUnownedList"
						@card-hovered="(card) => onCardHover(card)"
						@card-clicked="(card) => onCardAdd(card)"
						@card-shift-clicked="(card) => onCardAdd(card, true)"
						:item-size="settings?.decklistListSize || 'tiny'"
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
