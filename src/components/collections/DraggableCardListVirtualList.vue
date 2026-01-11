<script lang="ts" setup>
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import CardPreviewListitem from '../database/CardPreviewListitem.vue'
import {Icon} from '@iconify/vue'
import {useOwnedCards} from '@/composables/useOwnedCards'

const emit = defineEmits<{
	(e: 'cardHovered', card: TCardData): void
	(e: 'cardClicked', card: TCardData): void
	(e: 'cardRightClicked', card: TCardData): void
	(e: 'cardShiftClicked', card: TCardData): void
	(e: 'reorder', fromIndex: number, toIndex: number): void
}>()

interface IProps {
	cardList: TCardData[]
	activeCardId?: number | null
	itemSize?: 'tiny' | 'small' | 'medium' | 'large'
	showLimitedInfo?: boolean

	showOwnedHeart?: boolean
	showOwnedNumber?: boolean
	grayUnowned?: boolean
	showBanlistFor?: TBanlistFormat | 'none'
	draggable?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	itemSize: 'medium',
	draggable: true,
})

const {getOwned} = useOwnedCards()

// Compute which cards should be grayed out based on occurrence vs owned count
const grayedOutIndices = computed(() => {
	if (!props.grayUnowned) return new Set<number>()

	const grayed = new Set<number>()
	const occurrenceCount: Record<number, number> = {}

	props.cardList.forEach((card, index) => {
		const cardId = card.id
		occurrenceCount[cardId] = (occurrenceCount[cardId] || 0) + 1
		const currentOccurrence = occurrenceCount[cardId]
		const ownedCount = getOwned(cardId)

		// Gray out if this occurrence exceeds the owned count
		if (currentOccurrence > ownedCount) {
			grayed.add(index)
		}
	})

	return grayed
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
		Math.ceil((scrollPosition + containerHeight.value) / (CARD_HEIGHT.value + GAP)) +
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
	if (props.cardList.length === 0) return 0
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
// #region Drag and Drop
// ----------------------------------------------
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(event: DragEvent, index: number) {
	if (!props.draggable) return
	draggedIndex.value = index
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', String(index))
	}
}

function onDragEnd() {
	draggedIndex.value = null
	dragOverIndex.value = null
}

function onDragOver(event: DragEvent, index: number) {
	if (!props.draggable || draggedIndex.value === null) return
	event.preventDefault()
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move'
	}
	dragOverIndex.value = index
}

function onDragLeave() {
	dragOverIndex.value = null
}

function onDrop(event: DragEvent, toIndex: number) {
	if (!props.draggable) return
	event.preventDefault()
	const fromIndex = draggedIndex.value
	if (fromIndex !== null && fromIndex !== toIndex) {
		emit('reorder', fromIndex, toIndex)
	}
	draggedIndex.value = null
	dragOverIndex.value = null
}

// #endregion
// ----------------------------------------------

function onCardClick(card: TCardData) {
	emit('cardClicked', card)
}
function onHoverEnter(card: TCardData) {
	emit('cardHovered', card)
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
		class="w-full h-full overflow-y-scroll scrollable p-3"
		@scroll="handleScroll"
	>
		<!-- Empty state -->
		<div
			v-if="props.cardList.length === 0"
			class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
		>
			<Icon icon="material-symbols:credit-card-off-rounded" class="text-4xl" />
			<p class="text-lg font-medium">No cards found</p>
			<p class="text-sm opacity-75">Try adjusting your search or filters</p>
		</div>

		<!-- Virtual scroll container -->
		<div v-else class="relative w-full" :style="{height: totalHeight + 'px'}">
			<!-- Visible cards container -->
			<div
				class="absolute w-full flex flex-col gap-1.5"
				:style="{transform: `translateY(${offsetY}px)`}"
			>
				<div
					v-for="{card, index} in visibleCards"
					:key="`${card.id}-${index}`"
					:draggable="props.draggable"
					@dragstart="(e) => onDragStart(e, index)"
					@dragend="onDragEnd"
					@dragover="(e) => onDragOver(e, index)"
					@dragleave="onDragLeave"
					@drop="(e) => onDrop(e, index)"
					class="relative transition-transform duration-150"
					:class="{
						'opacity-50': draggedIndex === index,
						'ring-2 ring-accent-500 rounded':
							dragOverIndex === index && draggedIndex !== index,
					}"
				>
					<!-- Drop indicator line above -->
					<div
						v-if="
							dragOverIndex === index && draggedIndex !== null && draggedIndex > index
						"
						class="absolute -top-1 left-0 right-0 h-0.5 bg-accent-500 rounded-full"
					/>
					<CardPreviewListitem
						:card="card"
						:active="card.id === props.activeCardId"
						:size="props.itemSize"
						@click="() => onCardClick(card)"
						@mouseenter="() => onHoverEnter(card)"
						@shift-click="() => emit('cardShiftClicked', card)"
						@click.right="() => emit('cardRightClicked', card)"
						:show-limited-info="props.showLimitedInfo"
						:show-owned-heart="props.showOwnedHeart"
						:show-owned-number="props.showOwnedNumber"
						:gray-override="grayedOutIndices.has(index)"
						:show-banlist-for="props.showBanlistFor"
						:class="props.draggable ? 'cursor-grab active:cursor-grabbing' : ''"
					/>
					<!-- Drop indicator line below -->
					<div
						v-if="
							dragOverIndex === index && draggedIndex !== null && draggedIndex < index
						"
						class="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-500 rounded-full"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
