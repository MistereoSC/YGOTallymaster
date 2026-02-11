<script lang="ts" setup>
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {computed} from 'vue'
import CardPreview from '../database/CardPreview.vue'
import {useCardStack, useDeckTestDragDrop, TDragSource} from '@/composables/useDeckTestDragDrop'
import ContextMenu from '@/components/common/ContextMenu.vue'

const props = defineProps<{
	modelValue: TCardData[]
	faceUp?: boolean
	stackName: TDragSource
	label?: string
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: TCardData[]): void
	(e: 'cardHover', card: TCardData | null): void
	(e: 'cardRemoved', card: TCardData): void
	(e: 'click'): void
	(e: 'shuffle'): void
	(e: 'toggleFaceUp'): void
	(e: 'discardTop'): void
	(e: 'banishTop'): void
	(e: 'returnToHand'): void
	(e: 'returnToDeck'): void
}>()

// Create a local ref that syncs with modelValue
const internalCards = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

const {handleDragStart, handleDragOver, handleDragLeave, handleDrop, removeTopCard} = useCardStack(
	internalCards,
	props.stackName
)

const {isDragging, dropTarget, lastDropTarget, endDrag, clearLastDrop} = useDeckTestDragDrop()

// Handle the drop and notify about source card removal
function onDrop(event: DragEvent) {
	const dragged = handleDrop(event)
	if (dragged) {
		emit('cardRemoved', dragged.card)
	}
	endDrag()
}

// Handle drag start - only if there are cards
function onDragStart(event: DragEvent) {
	if (props.modelValue.length === 0) {
		event.preventDefault()
		return
	}
	handleDragStart(event)
}

// Handle drag end - remove the card from this stack if dropped elsewhere
function onDragEnd(_event: DragEvent) {
	const lastDrop = lastDropTarget.value
	if (lastDrop && lastDrop !== props.stackName) {
		// Card was dropped elsewhere, remove from this stack
		removeTopCard()
	}
	clearLastDrop()
	endDrag()
}

const topCard = computed(() => {
	if (props.modelValue.length === 0) return null
	return props.modelValue[props.modelValue.length - 1]
})

const isDropTarget = computed(() => dropTarget.value === props.stackName && isDragging.value)

function onDeckHover() {
	if (topCard.value && props.faceUp) {
		emit('cardHover', topCard.value)
	} else {
		emit('cardHover', null)
	}
}

// Context menu items
const contextMenuItems = computed(() => [
	{
		label: 'Shuffle',
		icon: 'mdi:shuffle',
		action: () => emit('shuffle'),
		disabled: props.modelValue.length < 2,
	},
	{
		label: props.faceUp ? 'Flip Face Down' : 'Flip Face Up',
		icon: 'mdi:rotate-3d-variant',
		action: () => emit('toggleFaceUp'),
		hidden: props.stackName !== 'mainDeck' && props.stackName !== 'extraDeck',
	},
	{
		label: 'Return to Hand',
		icon: 'mdi:hand-back-left',
		action: () => emit('returnToHand'),
		disabled: props.modelValue.length === 0,
		hidden: props.stackName === 'mainDeck' || props.stackName === 'extraDeck',
	},
	{
		label: 'Return to Deck',
		icon: 'mdi:cards',
		action: () => emit('returnToDeck'),
		disabled: props.modelValue.length === 0,
		hidden: props.stackName === 'mainDeck' || props.stackName === 'extraDeck',
	},
	{
		separator: true as const,
		hidden: props.stackName !== 'mainDeck' && props.stackName !== 'extraDeck',
	},
	{
		label: 'Draw',
		icon: 'mdi:hand-back-left',
		action: () => emit('returnToHand'),
		disabled: props.modelValue.length === 0,
		hidden: props.stackName !== 'mainDeck',
	},
	{
		label: 'Discard Top',
		icon: 'mdi:grave-stone',
		action: () => emit('discardTop'),
		disabled: props.modelValue.length === 0,
		hidden: props.stackName !== 'mainDeck' && props.stackName !== 'extraDeck',
	},
	{
		label: 'Banish Top',
		icon: 'mdi:cancel',
		action: () => emit('banishTop'),
		disabled: props.modelValue.length === 0,
		hidden: props.stackName !== 'mainDeck' && props.stackName !== 'extraDeck',
	},
])
</script>

<template>
	<ContextMenu :items="contextMenuItems">
		<template #trigger>
			<div
				class="w-29.5 h-43 cursor-pointer relative group"
				:draggable="modelValue.length > 0"
				@dragstart="onDragStart"
				@dragend="onDragEnd"
				@dragover="handleDragOver"
				@dragleave="handleDragLeave"
				@drop="onDrop"
				@mouseover="onDeckHover"
				@click="$emit('click')"
			>
				<span
					v-if="label"
					class="text-primary-400 text-xs text-center px-1 absolute bottom-2 rounded-md left-3 right-3 z-10 bg-primary-900/80"
				>
					{{ label }}
				</span>

				<!-- Empty state -->
				<div
					v-if="modelValue.length === 0"
					class="rounded-lg border-2 border-dashed w-full h-full bg-primary-900 border-primary-400 flex items-center justify-center group-hover:border-accent-400"
					:class="{'border-secondary-400': isDropTarget}"
				></div>
				<!-- Has cards -->
				<div v-else class="relative">
					<!-- Stack visual effect -->
					<div
						v-if="modelValue.length >= 16"
						class="absolute -bottom-2 -right-2 w-full h-full bg-card-effect rounded opacity-50"
					></div>
					<div
						v-if="modelValue.length >= 10"
						class="absolute -bottom-1.5 -right-1.5 w-full h-full bg-card-effect rounded opacity-50"
					></div>
					<div
						v-if="modelValue.length >= 5"
						class="absolute -bottom-1 -right-1 w-full h-full bg-card-effect rounded opacity-70"
					></div>
					<div
						v-if="modelValue.length >= 1"
						class="absolute -bottom-0.5 -right-0.5 w-full h-full bg-card-effect rounded opacity-70"
					></div>
					<!-- Top card -->
					<div class="relative">
						<div
							v-if="props.faceUp && topCard"
							class="outline-0 transition-all outline-offset-1 duration-100 rounded-sm"
							:class="{'outline-4 outline-secondary-400': isDropTarget}"
						>
							<CardPreview :card="topCard" />
						</div>
						<div
							v-else
							class="group-hover:outline-4 outline-accent-400 outline-0 transition-all outline-offset-1 duration-100 rounded-sm"
							:class="{'outline-4 outline-secondary-400': isDropTarget}"
						>
							<img
								alt="Deck"
								src="/assets/cardback.webp"
								class="w-full h-auto object-cover rounded"
							/>
						</div>
						<!-- Card count badge -->
						<div
							class="absolute top-0 right-0 bg-primary-900 text-contrast-800 text-xs font-bold rounded-md w-8 h-8 border border-primary-500 flex items-center justify-center"
						>
							{{ modelValue.length }}
						</div>
					</div>
				</div>
			</div>
		</template>
	</ContextMenu>
</template>

<style lang="scss" scoped></style>
