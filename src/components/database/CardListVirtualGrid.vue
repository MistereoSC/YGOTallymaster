<script lang="ts" setup>
import {
	onMounted,
	ref,
	computed,
	onUnmounted,
	nextTick,
	watch,
	type ComponentPublicInstance,
} from 'vue'
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardPreview from '@/components/database/CardPreview.vue'
import {Icon} from '@iconify/vue'
import CardContextMenu from '@/components/cards/CardContextMenu.vue'
import {useToast} from '@/composables/useToast'

interface IProps {
	cardList: TCardData[]
	activeCardId?: number | null
	itemSize?: 'small' | 'medium' | 'large' | 'tiny'
	itemGapPx?: number
	containerPaddingPx?: number

	showOwnedHeart?: boolean
	showOwnedNumber?: boolean
	grayUnowned?: boolean
	showBanlistFor?: TBanlistFormat | 'none'
	showCardContextMenu?: boolean
	showRefreshImageButton?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	itemSize: 'medium',
	itemGapPx: 16,
	containerPaddingPx: 8,

	showRefreshImageButton: false,
})

const emit = defineEmits<{
	(e: 'cardHovered', value: TCardData): void
	(e: 'cardClicked', value: TCardData): void
	(e: 'cardRightClicked', value: TCardData): void
	(e: 'cardShiftClicked', value: TCardData): void
}>()
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
let CARD_WIDTH = 173 // w-43.25 = 173px
let CARD_HEIGHT = 258 // h-64.5 = 258px
const BUFFER_ROWS = 2

const cardsPerRow = computed(() => {
	if (containerWidth.value === 0) return 1
	const availableWidth = containerWidth.value - props.containerPaddingPx * 2
	return Math.max(
		1,
		Math.floor((availableWidth + props.itemGapPx) / (CARD_WIDTH + props.itemGapPx))
	)
})

const totalRows = computed(() => {
	return Math.ceil(props.cardList.length / cardsPerRow.value)
})

// Calculate visible range (using debounced scroll position)
const visibleRange = computed(() => {
	const scrollPosition = debouncedScrollTop.value
	const startRow = Math.max(
		0,
		Math.floor(scrollPosition / (CARD_HEIGHT + props.itemGapPx)) - BUFFER_ROWS
	)
	const endRow = Math.min(
		totalRows.value,
		Math.ceil((scrollPosition + containerHeight.value) / (CARD_HEIGHT + props.itemGapPx)) +
			1 +
			BUFFER_ROWS
	)

	const startIndex = Math.max(0, startRow * cardsPerRow.value)
	const endIndex = Math.min(props.cardList.length, endRow * cardsPerRow.value)

	return {startIndex, endIndex, startRow}
})

// Get visible cards
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
	if (totalRows.value === 0) return 0
	return totalRows.value * (CARD_HEIGHT + props.itemGapPx) - props.itemGapPx
})

// Calculate offset for visible items
const offsetY = computed(() => {
	return visibleRange.value.startRow * (CARD_HEIGHT + props.itemGapPx)
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

function onHoverEnter(card: TCardData) {
	emit('cardHovered', card)
}

// Map to store refs to CardPreview components by card ID
const cardPreviewRefs = ref<Map<number, InstanceType<typeof CardPreview>>>(new Map())
function setCardPreviewRef(cardId: number, el: ComponentPublicInstance | Element | null) {
	if (el) {
		cardPreviewRefs.value.set(cardId, el as InstanceType<typeof CardPreview>)
	} else {
		cardPreviewRefs.value.delete(cardId)
	}
}

async function handleReloadImage(cardId: number) {
	const cardPreview = cardPreviewRefs.value.get(cardId)
	if (cardPreview && cardPreview.forceReloadImage) {
		await cardPreview.forceReloadImage()
	}
}

// #endregion
// ----------------------------------------------
// #region Setup
// ----------------------------------------------
onMounted(async () => {
	setCardSizes(props.itemSize)
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

function setCardSizes(size: 'small' | 'medium' | 'large' | 'tiny') {
	switch (size) {
		case 'tiny':
			CARD_WIDTH = 87 // w-21.75
			CARD_HEIGHT = 128 // h-32
			break
		case 'small':
			CARD_WIDTH = 118 // w-29.5
			CARD_HEIGHT = 172 // h-43
			break
		case 'medium':
			CARD_WIDTH = 173 // w-43.25
			CARD_HEIGHT = 258 // h-64.5
			break
		case 'large':
			CARD_WIDTH = 236 // w-59
			CARD_HEIGHT = 344 // h-86
			break
	}
}
watch(
	() => props.itemSize,
	(newVal) => {
		setCardSizes(newVal || 'medium')
		handleResize()
		scrollToTop()
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

defineExpose({
	scrollToTop,
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
				class="absolute w-full grid justify-center"
				:style="{
					transform: `translateY(${offsetY}px)`,
					gap: props.itemGapPx + 'px',
					gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
				}"
			>
				<div v-for="{card} in visibleCards" :key="card.id">
					<CardContextMenu
						:card="card"
						:disabled="!props.showCardContextMenu"
						:show-reload-image-button="props.showRefreshImageButton"
						@reload-image="handleReloadImage"
					>
						<CardPreview
							:ref="(el) => setCardPreviewRef(card.id, el)"
							:card="card"
							:active="card.id === props.activeCardId"
							:size="props.itemSize"
							@click.right="() => emit('cardRightClicked', card)"
							@click="onCardClick(card)"
							@shift-click="() => emit('cardShiftClicked', card)"
							@mouseenter="() => onHoverEnter(card)"
							:show-owned-heart="props.showOwnedHeart"
							:show-owned-number="props.showOwnedNumber"
							:gray-unowned="props.grayUnowned"
							:show-banlist-for="props.showBanlistFor"
							:show-context-menu="props.showCardContextMenu"
						/>
					</CardContextMenu>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
