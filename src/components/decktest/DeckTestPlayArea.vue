<script lang="ts" setup>
import {computed} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {TPlayAreaCard, usePlayArea, useDeckTestDragDrop} from '@/composables/useDeckTestDragDrop'
import CardPreview from '../database/CardPreview.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'

const props = defineProps<{
	modelValue: TPlayAreaCard[]
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: TPlayAreaCard[]): void
	(e: 'cardHover', card: TCardData): void
	(e: 'cardRemoved', data: {card: TCardData; instanceId: string}): void
	(e: 'discardCard', instanceId: string): void
	(e: 'banishCard', instanceId: string): void
	(e: 'returnToDeck', instanceId: string): void
	(e: 'returnToHand', instanceId: string): void
	// Bulk actions
	(e: 'reset'): void
	(e: 'discardAll'): void
	(e: 'banishAll'): void
	(e: 'moveAllToHand'): void
	(e: 'moveAllToDeck'): void
	// Token
	(e: 'createToken'): void
}>()

// Create a local ref that syncs with modelValue
const internalCards = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
})

const {
	handleCardDragStart,
	handleDragOver,
	handleDragLeave,
	handleDrop,
	toggleFaceDown,
	toggleRotation,
	getDisplayCards,
	removeCard,
} = usePlayArea(internalCards)

const {isDragging, dropTarget, lastDropTarget, endDrag, clearLastDrop} = useDeckTestDragDrop()

// Handle drop with source cleanup callback
function onDrop(event: DragEvent) {
	const dragged = handleDrop(event)
	if (dragged) {
		emit('cardRemoved', {
			card: dragged.card,
			instanceId: dragged.instanceId,
		})
	}
	endDrag()
}

// Handle drag end - remove card if dropped elsewhere
function onDragEnd(instanceId: string) {
	const lastDrop = lastDropTarget.value
	if (lastDrop && lastDrop !== 'playArea') {
		// Card was dropped elsewhere, remove from play area
		removeCard(instanceId)
	}
	clearLastDrop()
	endDrag()
}

// Display cards with ghost state
const displayCards = computed(() => getDisplayCards())

const isDropTarget = computed(() => dropTarget.value === 'playArea' && isDragging.value)

// Context menu items for a card
function getCardContextMenuItems(card: TPlayAreaCard) {
	const items = []

	// Tokens cannot be flipped face-down
	if (!card.isToken) {
		items.push({
			label: 'Flip',
			icon: 'mdi:rotate-3d-variant',
			action: () => toggleFaceDown(card.instanceId),
		})
	}

	items.push({
		label: 'Rotate',
		icon: 'mdi:rotate-right',
		action: () => toggleRotation(card.instanceId),
	})

	items.push({separator: true as const})

	// For tokens, show "Remove" instead of move options
	if (card.isToken) {
		items.push({
			label: 'Remove Token',
			icon: 'mdi:close-circle',
			action: () => emit('discardCard', card.instanceId),
		})
	} else {
		items.push(
			{
				label: 'Discard',
				icon: 'mdi:grave-stone',
				action: () => emit('discardCard', card.instanceId),
			},
			{
				label: 'Banish',
				icon: 'mdi:cancel',
				action: () => emit('banishCard', card.instanceId),
			},
			{
				label: 'Return to Hand',
				icon: 'mdi:hand-back-left',
				action: () => emit('returnToHand', card.instanceId),
			},
			{
				label: 'Return to Deck',
				icon: 'mdi:cards',
				action: () => emit('returnToDeck', card.instanceId),
			}
		)
	}

	return items
}

// Context menu items for the play area itself
const playAreaContextMenuItems = [
	{
		label: 'Create Token',
		icon: 'mdi:plus-circle',
		action: () => emit('createToken'),
	},
	{separator: true as const},
	{
		label: 'Reset',
		icon: 'mdi:refresh',
		action: () => emit('reset'),
	},
	{separator: true as const},
	{
		label: 'Discard All',
		icon: 'mdi:grave-stone',
		action: () => emit('discardAll'),
	},
	{
		label: 'Banish All',
		icon: 'mdi:cancel',
		action: () => emit('banishAll'),
	},
	{
		label: 'Move All to Hand',
		icon: 'mdi:hand-back-left',
		action: () => emit('moveAllToHand'),
	},
	{
		label: 'Move All to Deck',
		icon: 'mdi:cards',
		action: () => emit('moveAllToDeck'),
	},
]
</script>

<template>
	<ContextMenu :items="playAreaContextMenuItems">
		<template #trigger>
			<div
				class="relative w-full h-full deck-test_play-area"
				:class="{'ring-2 ring-secondary-400 ring-inset': isDropTarget}"
				@dragover="handleDragOver"
				@dragleave="handleDragLeave"
				@drop="onDrop"
			>
				<!-- Cards on play area -->
				<ContextMenu
					v-for="playAreaCard in displayCards"
					:key="playAreaCard.instanceId"
					:items="getCardContextMenuItems(playAreaCard)"
				>
					<template #trigger>
						<div
							class="absolute cursor-move select-none group transition-transform"
							:class="{
								'opacity-30': playAreaCard.isGhost,
								'rotate-90': playAreaCard.rotated,
							}"
							:style="{
								left: `${playAreaCard.x}px`,
								top: `${playAreaCard.y}px`,
							}"
							draggable="true"
							@dragstart="(e) => handleCardDragStart(e, playAreaCard)"
							@dragend="() => onDragEnd(playAreaCard.instanceId)"
							@mouseover="() => emit('cardHover', playAreaCard.card)"
						>
							<!-- Token card - desaturated cardback -->
							<div
								v-if="playAreaCard.isToken"
								class="group-hover:outline-4 outline-accent-400 outline-0 transition-all outline-offset-1 duration-100 rounded-sm"
							>
								<img
									src="/assets/cardback.webp"
									alt="Token"
									class="w-29.5 h-auto object-cover rounded shadow-lg grayscale brightness-125"
								/>
								<div
									class="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-lg"
								>
									TOKEN
								</div>
							</div>
							<!-- Face down card -->
							<div
								v-else-if="playAreaCard.faceDown"
								class="group-hover:outline-4 outline-accent-400 outline-0 transition-all outline-offset-1 duration-100 rounded-sm"
							>
								<img
									src="/assets/cardback.webp"
									alt="Face down card"
									class="w-29.5 h-auto object-cover rounded shadow-lg"
								/>
							</div>
							<!-- Normal face up card -->
							<div v-else>
								<CardPreview
									:card="playAreaCard.card"
									size="small"
									class="shadow-lg"
								/>
							</div>
						</div>
					</template>
				</ContextMenu>
			</div>
		</template>
	</ContextMenu>
</template>

<style lang="scss" scoped>
.deck-test_play-area {
	position: absolute;
	inset: 0;
	height: 100%;
	width: 100%;
	background-image: radial-gradient(var(--color-contrast-100) 1px, transparent 1px);
	background-size: 30px 30px;
}
</style>
