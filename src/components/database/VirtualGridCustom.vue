<script lang="ts" setup generic="T">
import {onMounted, ref, computed, onUnmounted, nextTick} from 'vue'

interface IProps {
	items: T[]
	itemDimensions: {width: number; height: number}
	itemGapPx?: number
	containerPaddingPx?: number
}
const props = withDefaults(defineProps<IProps>(), {
	itemGapPx: 16,
	containerPaddingPx: 8,
})

defineSlots<{
	item(props: {item: T; index: number}): any
}>()

// Function to get a unique key from an item
const getItemKey = (item: T, index: number): string | number => {
	if (item && typeof item === 'object' && 'id' in item) {
		return (item as {id: string | number}).id
	}
	return index
}
// ----------------------------------------------
// #region Virtual Scroll
// ----------------------------------------------
const BUFFER_ROWS = 2

const scrollContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const debouncedScrollTop = ref(0)
const isScrolling = ref(false)

const itemCount = computed(() => props.items.length)

const itemsPerRow = computed(() => {
	if (containerWidth.value === 0) return 1
	const availableWidth = containerWidth.value - props.containerPaddingPx * 2
	return Math.max(
		1,
		Math.floor(
			(availableWidth + props.itemGapPx) / (props.itemDimensions.width + props.itemGapPx)
		)
	)
})

const totalRows = computed(() => {
	return Math.ceil(itemCount.value / itemsPerRow.value)
})

// Calculate visible range (using debounced scroll position)
const visibleRange = computed(() => {
	const scrollPosition = debouncedScrollTop.value
	const startRow = Math.max(
		0,
		Math.floor(scrollPosition / (props.itemDimensions.height + props.itemGapPx)) - BUFFER_ROWS
	)
	const endRow = Math.min(
		totalRows.value,
		Math.ceil(
			(scrollPosition + containerHeight.value) /
				(props.itemDimensions.height + props.itemGapPx)
		) +
			1 +
			BUFFER_ROWS
	)

	const startIndex = Math.max(0, startRow * itemsPerRow.value)
	const endIndex = Math.min(itemCount.value, endRow * itemsPerRow.value)

	return {startIndex, endIndex, startRow}
})

// Get visible items
const visibleItems = computed(() => {
	const {startIndex, endIndex} = visibleRange.value
	const result = []
	for (let i = startIndex; i < endIndex && i < itemCount.value; i++) {
		result.push({
			item: props.items[i],
			index: i,
		})
	}
	return result
})

// Calculate total height for scrolling
const totalHeight = computed(() => {
	return totalRows.value * (props.itemDimensions.height + props.itemGapPx) - props.itemGapPx
})

// Calculate offset for visible items
const offsetY = computed(() => {
	return visibleRange.value.startRow * (props.itemDimensions.height + props.itemGapPx)
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

let resizeObserver: ResizeObserver | null = null

// #endregion
// ----------------------------------------------
// #region Setup
// ----------------------------------------------
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

function scrollToTop() {
	if (scrollContainer.value) {
		scrollContainer.value.scrollTop = 0
		scrollTop.value = 0
		debouncedScrollTop.value = 0
	}
}

function scrollTo(position: number) {
	if (scrollContainer.value) {
		scrollContainer.value.scrollTop = position
		scrollTop.value = position
		debouncedScrollTop.value = position
	}
}

function getScrollTop(): number {
	return scrollTop.value
}

defineExpose({
	scrollToTop,
	scrollTo,
	getScrollTop,
	handleResize,
})
</script>

<template>
	<div
		ref="scrollContainer"
		class="w-full h-full overflow-y-scroll scrollable"
		:style="{padding: props.containerPaddingPx + 'px'}"
		@scroll="handleScroll"
	>
		<!-- Virtual scroll container -->
		<div class="relative w-full" :style="{height: totalHeight + 'px'}">
			<!-- Visible cards container -->
			<div
				class="absolute w-full grid justify-center"
				:style="{
					transform: `translateY(${offsetY}px)`,
					gap: props.itemGapPx + 'px',
					gridTemplateColumns: `repeat(auto-fill, ${props.itemDimensions.width}px)`,
				}"
			>
				<div
					v-for="{item, index} in visibleItems"
					:key="getItemKey(item, index)"
					:style="{
						width: `${props.itemDimensions.width}px`,
						height: `${props.itemDimensions.height}px`,
					}"
				>
					<slot name="item" :item="item" :index="index" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
