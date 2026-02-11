<script lang="ts" setup>
import {computed} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardPreview from '../database/CardPreview.vue'
import {useHandCards, useDeckTestDragDrop} from '@/composables/useDeckTestDragDrop'
import ContextMenu from '@/components/common/ContextMenu.vue'

const props = defineProps<{
	modelValue: TCardData[]
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: TCardData[]): void
	(e: 'cardHover', card: TCardData): void
	(e: 'cardRemoved', data: {card: TCardData; index: number}): void
	(e: 'discardCard', index: number): void
	(e: 'banishCard', index: number): void
	(e: 'returnToDeck', index: number): void
}>()

// Create a local ref that syncs with modelValue
const internalCards = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

const {
	previewInsertIndex,
	handleCardDragStart,
	handleDragOver,
	handleDragLeave,
	handleDrop,
	removeCard,
	getDisplayCards,
} = useHandCards(internalCards)

const {draggedCard, isDragging, dropTarget, lastDropTarget, endDrag, clearLastDrop} =
	useDeckTestDragDrop()

// Handle drop and notify parent
function onDrop(event: DragEvent) {
	const dragged = handleDrop(event)
	if (dragged && dragged.source !== 'hand') {
		// Card came from outside, parent needs to handle removal from source
		emit('cardRemoved', {card: dragged.card, index: -1})
	}
	endDrag()
}

// Handle drag end - remove card if dropped elsewhere
function onDragEnd(cardIndex: number) {
	const lastDrop = lastDropTarget.value
	if (lastDrop && lastDrop !== 'hand') {
		// Card was dropped elsewhere, remove from hand
		removeCard(cardIndex)
	}
	clearLastDrop()
	endDrag()
}

const displayCards = computed(() => getDisplayCards())

const isDropTarget = computed(() => dropTarget.value === 'hand' && isDragging.value)

// Get the preview card (if dragging from another zone)
const previewCard = computed(() => {
	if (
		isDragging.value &&
		draggedCard.value &&
		draggedCard.value.source !== 'hand' &&
		previewInsertIndex.value !== null
	) {
		return draggedCard.value.card
	}
	return null
})

// Context menu items for a card
function getCardContextMenuItems(index: number) {
	return [
		{
			label: 'Discard',
			icon: 'mdi:grave-stone',
			action: () => emit('discardCard', index),
		},
		{
			label: 'Banish',
			icon: 'mdi:cancel',
			action: () => emit('banishCard', index),
		},
		{
			label: 'Return to Deck',
			icon: 'mdi:cards',
			action: () => emit('returnToDeck', index),
		},
	]
}

function onHorizontalWheel(event: WheelEvent) {
	const container = event.currentTarget as HTMLElement
	if (container) {
		event.preventDefault()
		container.scrollLeft += event.deltaY
	}
}
</script>

<template>
	<div
		class="h-full overflow-hidden"
		:class="{'ring-2 ring-secondary-400 ring-inset': isDropTarget}"
		@dragover="handleDragOver"
		@dragleave="handleDragLeave"
		@drop="onDrop"
	>
		<div
			class="flex gap-1 w-full items-center justify-center h-full overflow-x-scroll scrollable px-1"
			@wheel="onHorizontalWheel"
		>
			<!-- Cards with preview insertion point -->
			<template
				v-for="(cardData, index) in displayCards"
				:key="`${cardData.card.id}-${cardData.index}`"
			>
				<!-- Preview insertion before this card -->
				<div v-if="previewInsertIndex === index && previewCard" class="shrink-0 opacity-50">
					<CardPreview :card="previewCard" size="small" />
				</div>
				<!-- Actual card (ghost when being dragged) -->
				<ContextMenu :items="getCardContextMenuItems(cardData.index)">
					<template #trigger>
						<div
							:class="{'opacity-30': cardData.isGhost}"
							class="shrink-0"
							draggable="true"
							@dragstart="
								(e) => handleCardDragStart(e, cardData.card, cardData.index)
							"
							@dragend="() => onDragEnd(cardData.index)"
							@mouseover="() => emit('cardHover', cardData.card)"
						>
							<CardPreview :card="cardData.card" size="small" />
						</div>
					</template>
				</ContextMenu>
			</template>
			<!-- Preview insertion at end -->
			<div
				v-if="previewInsertIndex === modelValue.length && previewCard"
				class="shrink-0 opacity-50"
			>
				<CardPreview :card="previewCard" size="small" />
			</div>
			<!-- Empty state hint -->
			<div v-if="modelValue.length === 0 && !isDragging" class="text-primary-400 text-sm">
				No cards in hand
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
