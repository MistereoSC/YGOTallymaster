<script lang="ts" setup>
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ref} from 'vue'
import CardPreview from '../database/CardPreview.vue'

interface IProps {
	modelValue: TCardData[]
	allowCardRemoval?: boolean
	allowReorder?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	allowCardRemoval: true,
	allowReorder: true,
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: TCardData[]): void
	(e: 'cardHover', value: TCardData): void
}>()

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onCardHover(card: TCardData) {
	emit('cardHover', card)
}

function onCardRemove(index: number) {
	const newValue = [...props.modelValue]
	newValue.splice(index, 1)
	emit('update:modelValue', newValue)
}

// Drag and drop handlers
function onDragStart(event: DragEvent, index: number) {
	if (!props.allowReorder) return
	draggedIndex.value = index
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', index.toString())
	}
}

function onDragOver(event: DragEvent, index: number) {
	if (!props.allowReorder || draggedIndex.value === null) return
	event.preventDefault()
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move'
	}
	dragOverIndex.value = index
}

function onDragLeave() {
	dragOverIndex.value = null
}

function onDrop(event: DragEvent, targetIndex: number) {
	if (!props.allowReorder) return
	event.preventDefault()

	const sourceIndex = draggedIndex.value
	if (sourceIndex === null || sourceIndex === targetIndex) {
		resetDragState()
		return
	}

	const newValue = [...props.modelValue]
	const [draggedItem] = newValue.splice(sourceIndex, 1)
	newValue.splice(targetIndex, 0, draggedItem)

	emit('update:modelValue', newValue)
	resetDragState()
}

function onDragEnd() {
	resetDragState()
}

function resetDragState() {
	draggedIndex.value = null
	dragOverIndex.value = null
}
</script>

<template>
	<div
		class="w-full grid justify-center gap-2"
		:style="{
			gridTemplateColumns: `repeat(auto-fill, 87px)`,
		}"
	>
		<div
			v-for="(card, index) in props.modelValue"
			:key="`card_${index}_${card.id}`"
			class="card-drag-wrapper"
			:class="{
				'is-dragging': draggedIndex === index,
				'is-drag-over': dragOverIndex === index && draggedIndex !== index,
			}"
			:draggable="allowReorder"
			@dragstart="(e) => onDragStart(e, index)"
			@dragover="(e) => onDragOver(e, index)"
			@dragleave="onDragLeave"
			@drop="(e) => onDrop(e, index)"
			@dragend="onDragEnd"
		>
			<CardPreview
				:card="card"
				:size="'tiny'"
				@mouseenter="() => onCardHover(card)"
				@click.right="() => onCardRemove(index)"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.card-drag-wrapper {
	cursor: grab;
	transition: transform 0.15s ease, opacity 0.15s ease;
	border-radius: 4px;

	&:active {
		cursor: grabbing;
	}

	&.is-dragging {
		opacity: 0.4;
		transform: scale(0.95);
	}

	&.is-drag-over {
		transform: scale(1.05);
		box-shadow: 0 0 0 2px var(--color-primary, #3b82f6);
	}
}
</style>
