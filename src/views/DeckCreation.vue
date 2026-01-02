<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import DeckCardGrid from '@/components/decks/DeckCardGrid.vue'
import {useCardSearch} from '@/composables/useCardSearch'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {onBeforeUnmount, onMounted, onUnmounted, ref} from 'vue'

const props = defineProps<{
	deckData: TDeckData
}>()
const emit = defineEmits<{
	(e: 'save'): void
	(e: 'close'): void
}>()

const {resetSearch, fullCardList, searchResults} = useCardSearch()
const store = useDeckList()
const cards = ref<{main: TCardData[]; extra: TCardData[]; side: TCardData[]}>({
	main: [],
	extra: [],
	side: [],
})
const TMP_LIST = ref<TCardData[]>([])

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
	cards.value = await store.getDeckCards(props.deckData)
	loading.value = false
	TMP_LIST.value = [...cards.value.main, ...cards.value.extra, ...cards.value.side]

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

function onCardAdd(card: TCardData) {
	switch (card.frameType) {
		case 'fusion':
		case 'fusion_pendulum':
		case 'synchro':
		case 'synchro_pendulum':
		case 'xyz':
		case 'xyz_pendulum':
		case 'link':
			if (cards.value.extra.length >= 20 || !checkDeckLimit(card.id)) return
			cards.value.extra.push(card)
			break
		default:
			if (cards.value.main.length >= 80 || !checkDeckLimit(card.id)) return
			cards.value.main.push(card)
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
	return
}

onBeforeUnmount(async () => {
	const newDeckData = {...props.deckData}
	newDeckData.main = cards.value.main.map((c) => c.id)
	newDeckData.extra = cards.value.extra.map((c) => c.id)
	newDeckData.side = cards.value.side.map((c) => c.id)
	await store.saveDeck(newDeckData)
})
</script>

<template>
	<div class="grid h-full grid-cols-[auto_1fr_auto]" v-if="!loading">
		<div
			class="min-w-86 w-[25vw] max-w-132 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
		>
			<div class="grid grid-rows-[auto_1fr] overflow-hidden">
				<div class="bg-primary-600 flex items-center justify-end p-1 gap-1">
					<span>
						<Button
							size="small"
							rounded
							icon="material-symbols:keyboard-return-rounded"
							@click="emit('close')"
						/>
					</span>
					<span>
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
		<div class="grid grid-rows-[2fr_1fr] overflow-hidden" @wheel="onDeckAreaWheel">
			<div class="overflow-hidden grid grid-rows-[auto_auto_1fr]">
				<h3 class="text-xl font-bold pl-4 pt-1">
					<span>Main Deck</span>
					<span
						class="text-contrast-600 pl-8 font-semibold"
						:class="{'text-red-400': cards.main.length > 60 || cards.main.length < 40}"
						>[{{ cards.main.length }}]
					</span>
				</h3>
				<div class="overflow-y-scroll scrollable flex flex-wrap gap-2 p-2">
					<DeckCardGrid v-model="cards.main" @cardHover="onCardHover" />
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
				<div class="h-full overflow-y-scroll scrollable flex flex-wrap gap-2 p-2">
					<DeckCardGrid v-model="cards.extra" @cardHover="onCardHover" />
				</div>
			</div>
		</div>
		<div
			class="min-w-86 w-[25vw] max-w-132 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
		>
			<div class="h-full grid grid-rows-2 overflow-hidden gap">
				<div class="overflow-y-scroll scrollable border-b-2 border-b-primary-400 p-2">
					<CardFilter :search-while-typing="true" />
				</div>
				<div class="h-full overflow-y-scroll scrollable">
					<CardListVirtualList
						:card-list="searchResults == null ? fullCardList : searchResults"
						item-size="tiny"
						:show-limited-info="true"
						@card-hovered="(card) => onCardHover(card)"
						@card-clicked="(card) => onCardAdd(card)"
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
