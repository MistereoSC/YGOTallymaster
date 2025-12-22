<script lang="ts" setup>
import {onMounted, ref, computed, onUnmounted, nextTick, watch} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardPreview from '@/components/database/CardPreview.vue'

const props = defineProps<{
	cardList: TCardData[]
	activeCardId?: number | null
}>()
const emit = defineEmits<{
	(e: 'cardClicked', value: TCardData): void
}>()
const cardList = ref([] as TCardData[])
// ----------------------------------------------
// #region Virtual Scroll
// ----------------------------------------------
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

// #endregion
// ----------------------------------------------
// #region Setup
// ----------------------------------------------
onMounted(async () => {
	cardList.value = props.cardList
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

watch(
	() => props.cardList.length,
	() => {
		cardList.value = props.cardList
	}
)

// #endregion
// ----------------------------------------------

function onCardClick(card: TCardData) {
	emit('cardClicked', card)
}

function scrollToTop() {
	if (scrollContainer.value) {
		scrollContainer.value.scrollTop = 0
		scrollTop.value = 0
		debouncedScrollTop.value = 0
	}
}

// Expose methods to parent components
defineExpose({
	scrollToTop,
	handleResize,
})
</script>

<template>
	<div
		ref="scrollContainer"
		class="w-full h-full overflow-y-scroll scrollable p-4"
		@scroll="handleScroll"
	>
		<!-- Virtual scroll container -->
		<div class="relative w-full" :style="{height: totalHeight + 'px'}">
			<!-- Visible cards container -->
			<div
				class="absolute w-full flex flex-wrap gap-4 justify-center"
				:style="{transform: `translateY(${offsetY}px)`}"
			>
				<CardPreview
					v-for="{card} in visibleCards"
					:key="card.id"
					:card="card"
					:active="card.id === props.activeCardId"
					size="small"
					@click="onCardClick(card)"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
