<script lang="ts" setup>
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import CardPreviewListitem from './CardPreviewListitem.vue'

const emit = defineEmits<{
	(e: 'cardClicked', value: TCardData): void
}>()

interface IProps {
	cardList: TCardData[]
	activeCardId?: number | null
	itemSize?: 'small' | 'medium' | 'large' | 'tiny'
}
const props = withDefaults(defineProps<IProps>(), {
	itemSize: 'medium',
})

const scrollContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const debouncedScrollTop = ref(0)
const isScrolling = ref(false)

const BUFFER_ROWS = 4
const GAP = 6 // gap-1.5
const CARD_HEIGHT = computed(() => {
	return props.itemSize === 'small'
		? 48
		: props.itemSize === 'large'
		? 80
		: props.itemSize === 'tiny'
		? 32
		: 64
})

const visibleRange = computed(() => {
	const scrollPosition = debouncedScrollTop.value
	const startRow = Math.max(
		0,
		Math.floor(scrollPosition / (CARD_HEIGHT.value + GAP)) - BUFFER_ROWS
	)
	const endRow = Math.min(
		props.cardList.length,
		Math.ceil(
			(scrollPosition + containerHeight.value) / (CARD_HEIGHT.value + GAP)
		) +
			1 +
			BUFFER_ROWS
	)

	const startIndex = Math.max(0, startRow)
	const endIndex = Math.min(props.cardList.length, endRow)

	return {startIndex, endIndex, startRow}
})

const visibleCards = computed(() => {
	const {startIndex, endIndex} = visibleRange.value
	const result = []
	for (let i = startIndex; i < endIndex && i < props.cardList.length; i++) {
		result.push({
			card: props.cardList[i],
			index: i,
		})
	}
	return result
})

// Calculate total height for scrolling
const totalHeight = computed(() => {
	return props.cardList.length * (CARD_HEIGHT.value + GAP) - GAP
})

// Calculate offset for visible items
const offsetY = computed(() => {
	return visibleRange.value.startRow * (CARD_HEIGHT.value + GAP)
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
	}, 50)
}

const handleResize = () => {
	if (scrollContainer.value) {
		containerWidth.value = scrollContainer.value.clientWidth
		containerHeight.value = scrollContainer.value.clientHeight
	}
}
watch(
	() => props.itemSize,
	() => {
		handleResize()
		scrollToTop()
	}
)

// #endregion
// ----------------------------------------------
// #region Setup
// ----------------------------------------------
let resizeObserver: ResizeObserver | null = null
onMounted(async () => {
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
				class="absolute w-full flex flex-col gap-1.5"
				:style="{transform: `translateY(${offsetY}px)`}"
			>
				<CardPreviewListitem
					v-for="{card} in visibleCards"
					:key="card.id"
					:card="card"
					:active="card.id === props.activeCardId"
					:size="props.itemSize"
					@click="onCardClick(card)"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
