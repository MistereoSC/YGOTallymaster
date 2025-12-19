<script lang="ts" setup>
import {onMounted, ref, computed, onUnmounted, nextTick} from 'vue'
import {TCardData} from '../libs/interfaces/YGOProInterfaces'
import {getCardList} from '../libs/CardData'
import CardPreview from '../components/database/CardPreview.vue'
import CardFullView from '../components/database/CardFullView.vue'
import {Icon} from '@iconify/vue'

const cardList = ref([] as TCardData[])
const scrollContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const debouncedScrollTop = ref(0)
const isScrolling = ref(false)

// Card dimensions
const CARD_WIDTH = 173 // w-43.25 = 173px
const CARD_HEIGHT = 258 // h-64.5 = 258px
const GAP = 16 // gap-4 = 16px

const cardsPerRow = computed(() => {
	if (containerWidth.value === 0) return 1
	return Math.floor((containerWidth.value + GAP) / (CARD_WIDTH + GAP))
})

const totalRows = computed(() => {
	return Math.ceil(cardList.value.length / cardsPerRow.value)
})

// Calculate visible range (using debounced scroll position)
const visibleRange = computed(() => {
	const scrollPosition = debouncedScrollTop.value
	const startRow = Math.floor(scrollPosition / (CARD_HEIGHT + GAP))
	const endRow = Math.min(
		totalRows.value,
		Math.ceil(
			(scrollPosition + containerHeight.value) / (CARD_HEIGHT + GAP)
		) + 1
	)

	const startIndex = Math.max(0, startRow * cardsPerRow.value)
	const endIndex = Math.min(cardList.value.length, endRow * cardsPerRow.value)

	return {startIndex, endIndex, startRow}
})

// Get visible cards
const visibleCards = computed(() => {
	const {startIndex, endIndex} = visibleRange.value
	return cardList.value.slice(startIndex, endIndex).map((card, index) => ({
		card,
		index: startIndex + index,
	}))
})

// Calculate total height for scrolling
const totalHeight = computed(() => {
	return totalRows.value * (CARD_HEIGHT + GAP) - GAP
})

// Calculate offset for visible items
const offsetY = computed(() => {
	return visibleRange.value.startRow * (CARD_HEIGHT + GAP)
})

let scrollDebounceTimer: NodeJS.Timeout | null = null

const handleScroll = (event: Event) => {
	const target = event.target as HTMLElement
	scrollTop.value = target.scrollTop
	isScrolling.value = true

	if (scrollDebounceTimer) {
		clearTimeout(scrollDebounceTimer)
	}

	// Set new timer - update rendered components after scrolling stops
	scrollDebounceTimer = setTimeout(() => {
		debouncedScrollTop.value = scrollTop.value
		isScrolling.value = false
	}, 100)
}

const handleResize = () => {
	if (scrollContainer.value) {
		containerWidth.value = scrollContainer.value.clientWidth
		containerHeight.value = scrollContainer.value.clientHeight
	}
}

let resizeObserver: ResizeObserver | null = null
onMounted(async () => {
	cardList.value = await getCardList()

	await nextTick()
	handleResize()

	debouncedScrollTop.value = 0

	if (scrollContainer.value) {
		resizeObserver = new ResizeObserver(handleResize)
		resizeObserver.observe(scrollContainer.value)
	}
})

onUnmounted(() => {
	if (resizeObserver) {
		resizeObserver.disconnect()
	}
	if (scrollDebounceTimer) {
		clearTimeout(scrollDebounceTimer)
	}
})

const activeCard = ref<TCardData | null>(null)
function onCardClick(card: TCardData) {
	if (activeCard.value && activeCard.value.id === card.id) {
		activeCard.value = null
	} else {
		activeCard.value = card
	}
	handleResize()
}
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<!-- <div class="w-full flex pl-8 py-1 bg-primary-600">
			{{ cardList.length }} Cards Total |
			{{ visibleCards.length }} Rendered | Starting at #{{
				visibleRange.startIndex + 1
			}}
			|
			{{ activeCard ? activeCard.name : 'No Active Card' }}
		</div> -->
		<span></span>
		<div class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden">
			<div
				ref="scrollContainer"
				class="w-full h-full overflow-y-scroll scrollable p-4"
				@scroll="handleScroll"
			>
				<!-- Virtual scroll container -->
				<div
					class="relative w-full"
					:style="{height: totalHeight + 'px'}"
				>
					<!-- Visible cards container -->
					<div
						class="absolute w-full flex flex-wrap gap-4 justify-center"
						:style="{transform: `translateY(${offsetY}px)`}"
					>
						<CardPreview
							v-for="{card} in visibleCards"
							:key="card.id"
							:card="card"
							size="small"
							@click="onCardClick(card)"
						/>
					</div>
				</div>
			</div>

			<div
				class="min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div
					class="w-full min-h-12 bg-primary-900 flex items-center p-2"
				>
					<span v-if="activeCard" class="flex justify-between w-full">
						<button
							class="rounded-full bg-accent-500 p-1 cursor-pointer hover:bg-accent-400"
							@click="activeCard = null"
						>
							<Icon
								icon="material-symbols:arrow-menu-open-rounded"
								class="text-2xl"
							/>
						</button>
						<span> </span>
					</span>
				</div>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView v-if="activeCard" :card="activeCard" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
