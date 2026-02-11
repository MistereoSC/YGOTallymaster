<script lang="ts" setup>
import {computed, ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {TDragSource, useDeckTestDragDrop} from '@/composables/useDeckTestDragDrop'
import CardPreview from '../database/CardPreview.vue'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	cards: TCardData[]
	stackName: TDragSource | null
	label: string
}>()
const emit = defineEmits<{
	(e: 'cardHover', card: TCardData): void
	(e: 'cardRemoved', index: number): void
	(e: 'close'): void
}>()

const {startDrag, lastDropTarget, endDrag, clearLastDrop} = useDeckTestDragDrop()

// Track which card index is being dragged
const draggedIndex = ref<number | null>(null)

function handleCardDragStart(event: DragEvent, card: TCardData, index: number) {
	if (!props.stackName) return
	draggedIndex.value = index
	startDrag(card, props.stackName, index, event)
}

function handleDragEnd() {
	const lastDrop = lastDropTarget.value
	// Remove card if dropped on a different target (not the originating stack)
	if (lastDrop && lastDrop !== props.stackName && draggedIndex.value !== null) {
		emit('cardRemoved', draggedIndex.value)
	}
	draggedIndex.value = null
	clearLastDrop()
	endDrag()
}

// Reverse cards so top of stack (last in array) shows first
const displayCards = computed(() => {
	return [...props.cards].reverse().map((card, reversedIndex) => ({
		card,
		originalIndex: props.cards.length - 1 - reversedIndex,
		isGhost: draggedIndex.value === props.cards.length - 1 - reversedIndex,
	}))
})
</script>

<template>
	<div class="h-full flex flex-col overflow-hidden">
		<!-- Header -->
		<div
			v-if="stackName"
			class="p-2 border-b border-primary-600 flex items-center justify-between shrink-0"
		>
			<h3 class="text-sm font-bold text-contrast-600 truncate">{{ label }}</h3>
			<button
				class="text-primary-400 hover:text-contrast-600 cursor-pointer"
				@click="$emit('close')"
			>
				<Icon icon="mdi:close" />
			</button>
		</div>
		<!-- Empty state -->
		<div
			v-if="!stackName"
			class="flex-1 flex items-center justify-center text-primary-400 text-sm p-2 text-center"
		>
			Click a card stack to view its contents
		</div>
		<!-- Card list -->
		<div
			v-else-if="cards.length === 0"
			class="flex-1 flex items-center justify-center text-primary-400 text-sm"
		>
			No cards
		</div>
		<div
			v-else
			class="flex-1 overflow-y-scroll scrollable py-2 flex flex-col gap-2 items-center pl-3"
		>
			<div
				v-for="cardData in displayCards"
				:key="`${cardData.card.id}-${cardData.originalIndex}`"
				class="shrink-0 cursor-move"
				:class="{'opacity-30': cardData.isGhost}"
				draggable="true"
				@dragstart="(e) => handleCardDragStart(e, cardData.card, cardData.originalIndex)"
				@dragend="handleDragEnd"
				@mouseover="$emit('cardHover', cardData.card)"
			>
				<CardPreview :card="cardData.card" size="tiny" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
