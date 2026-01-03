<script lang="ts" setup generic="T">
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'

interface IProps {
	items: T[]
	itemHeight: number
	listGapPx?: number
}
const props = withDefaults(defineProps<IProps>(), {
	listGapPx: 6,
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

const scrollContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const containerHeight = ref(0)
const scrollTop = ref(0)
const debouncedScrollTop = ref(0)
const isScrolling = ref(false)

const BUFFER_ROWS = 4

const visibleRange = computed(() => {
	const scrollPosition = debouncedScrollTop.value
	const startRow = Math.max(
		0,
		Math.floor(scrollPosition / (props.itemHeight + props.listGapPx)) - BUFFER_ROWS
	)
	const endRow = Math.min(
		props.items.length,
		Math.ceil((scrollPosition + containerHeight.value) / (props.itemHeight + props.listGapPx)) +
			1 +
			BUFFER_ROWS
	)

	const startIndex = Math.max(0, startRow)
	const endIndex = Math.min(props.items.length, endRow)

	return {startIndex, endIndex, startRow}
})

const visibleItems = computed(() => {
	const {startIndex, endIndex} = visibleRange.value
	const result = []
	for (let i = startIndex; i < endIndex && i < props.items.length; i++) {
		result.push({
			item: props.items[i],
			index: i,
		})
	}
	return result
})

// Calculate total height for scrolling
const totalHeight = computed(() => {
	return props.items.length * (props.itemHeight + props.listGapPx) - props.listGapPx
})

// Calculate offset for visible items
const offsetY = computed(() => {
	return visibleRange.value.startRow * (props.itemHeight + props.listGapPx)
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
		class="w-full h-full overflow-y-scroll scrollable p-4"
		@scroll="handleScroll"
	>
		<!-- Virtual scroll container -->
		<div class="relative w-full" :style="{height: totalHeight + 'px'}">
			<!-- Visible cards container -->
			<div
				class="absolute w-full flex flex-col"
				:style="{transform: `translateY(${offsetY}px)`, gap: `${props.listGapPx}px`}"
			>
				<div
					v-for="{item, index} in visibleItems"
					:key="getItemKey(item, index)"
					:style="{height: `${props.itemHeight}px`}"
				>
					<slot name="item" :item="item" :index="index" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
