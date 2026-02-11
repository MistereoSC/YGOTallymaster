import {ref, computed, Ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'

// Types for drag-and-drop system
export type TDragSource =
	| 'hand'
	| 'playArea'
	| 'mainDeck'
	| 'extraDeck'
	| 'graveyard'
	| 'banishment'

export type TDraggedCard = {
	card: TCardData
	source: TDragSource
	sourceIndex?: number // For hand cards
	instanceId: string // Unique identifier for this drag instance
	isToken?: boolean // Whether this is a token card
} | null

export type TPlayAreaCard = {
	card: TCardData
	instanceId: string
	x: number
	y: number
	faceDown: boolean
	rotated: boolean
	isToken?: boolean
}

// Generate unique instance ID for tracking cards
let instanceCounter = 0
export function generateInstanceId(): string {
	return `card-${Date.now()}-${++instanceCounter}`
}

// Shared drag state
const draggedCard = ref<TDraggedCard>(null)
const isDragging = ref(false)
const dropTarget = ref<TDragSource | null>(null)
const lastDropTarget = ref<TDragSource | null>(null) // Stores where card was dropped
const sharedDragOffset = ref({x: 0, y: 0}) // Offset from card corner to cursor

export function useDeckTestDragDrop() {
	// Start dragging a card
	function startDrag(
		card: TCardData,
		source: TDragSource,
		sourceIndex?: number,
		event?: DragEvent,
		offset?: {x: number; y: number},
		isToken?: boolean
	) {
		const instanceId = generateInstanceId()
		draggedCard.value = {
			card,
			source,
			sourceIndex,
			instanceId,
			isToken,
		}
		isDragging.value = true
		lastDropTarget.value = null // Reset on new drag

		// Store the drag offset (where on the card the user clicked)
		if (offset) {
			sharedDragOffset.value = offset
		} else if (event) {
			// Calculate offset from event if not provided
			const target = event.currentTarget as HTMLElement
			if (target) {
				const rect = target.getBoundingClientRect()
				sharedDragOffset.value = {
					x: event.clientX - rect.left,
					y: event.clientY - rect.top,
				}
			}
		} else {
			// Default to center of card
			sharedDragOffset.value = {x: 59, y: 86} // Half of 118x172
		}

		if (event?.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move'
			event.dataTransfer.setData('text/plain', instanceId)
		}
	}

	// Record where the drop occurred (called before endDrag)
	function recordDrop(target: TDragSource) {
		lastDropTarget.value = target
	}

	// End dragging
	function endDrag() {
		draggedCard.value = null
		isDragging.value = false
		dropTarget.value = null
		// Don't clear lastDropTarget here - it's needed by dragend handler
	}

	// Clear the last drop target (called after source cleanup)
	function clearLastDrop() {
		lastDropTarget.value = null
	}

	// Set current drop target for visual feedback
	function setDropTarget(target: TDragSource | null) {
		dropTarget.value = target
	}

	// Check if currently dragging
	function getDraggedCard() {
		return draggedCard.value
	}

	return {
		// State
		draggedCard: computed(() => draggedCard.value),
		isDragging: computed(() => isDragging.value),
		dropTarget: computed(() => dropTarget.value),
		lastDropTarget: computed(() => lastDropTarget.value),
		sharedDragOffset: computed(() => sharedDragOffset.value),

		// Methods
		startDrag,
		endDrag,
		setDropTarget,
		getDraggedCard,
		recordDrop,
		clearLastDrop,
	}
}

// Hook for managing a card stack (deck, graveyard, banishment)
export function useCardStack(cards: Ref<TCardData[]>, stackName: TDragSource) {
	const {startDrag, draggedCard, setDropTarget, recordDrop} = useDeckTestDragDrop()

	function handleDragStart(event: DragEvent) {
		if (cards.value.length === 0) return
		const topCard = cards.value[cards.value.length - 1]
		startDrag(topCard, stackName, cards.value.length - 1, event)
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move'
		}
		setDropTarget(stackName)
	}

	function handleDragLeave() {
		setDropTarget(null)
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		const dragged = draggedCard.value
		if (!dragged) return

		// Tokens cannot be added to stacks - they just get removed
		if (!dragged.isToken) {
			// Add card to top of stack
			cards.value = [...cards.value, dragged.card]
		}
		recordDrop(stackName) // Record where the drop occurred
		setDropTarget(null)

		return dragged // Return for source cleanup
	}

	function removeTopCard(): TCardData | null {
		if (cards.value.length === 0) return null
		const topCard = cards.value[cards.value.length - 1]
		cards.value = cards.value.slice(0, -1)
		return topCard
	}

	return {
		handleDragStart,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		removeTopCard,
	}
}

// Hook for managing hand cards
export function useHandCards(cards: Ref<TCardData[]>) {
	const {startDrag, draggedCard, setDropTarget, isDragging, recordDrop} = useDeckTestDragDrop()

	const draggedFromHandIndex = ref<number | null>(null)
	const previewInsertIndex = ref<number | null>(null)

	function handleCardDragStart(event: DragEvent, card: TCardData, index: number) {
		draggedFromHandIndex.value = index
		startDrag(card, 'hand', index, event)
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move'
		}

		const dragged = draggedCard.value

		// Tokens can't be added to hand, don't show preview
		if (dragged?.isToken) {
			previewInsertIndex.value = null
			setDropTarget('hand')
			return
		}

		// Calculate insert position based on mouse X position
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()

		// Account for centered cards: calculate the offset from left
		const cardWidth = 118 + 4 // small card width + gap
		const totalCardsWidth = cards.value.length * cardWidth
		const centerOffset = Math.max(0, (rect.width - totalCardsWidth) / 2)

		// Adjust x position relative to where cards actually start
		const x = event.clientX - rect.left - centerOffset

		// Find the card slot where we're hovering
		const insertIndex = Math.max(0, Math.floor(x / cardWidth))

		// Don't show preview at original position if dragging from hand
		if (dragged?.source === 'hand' && dragged.sourceIndex === insertIndex) {
			previewInsertIndex.value = null
		} else {
			previewInsertIndex.value = Math.min(insertIndex, cards.value.length)
		}

		setDropTarget('hand')
	}

	function handleDragLeave(event: DragEvent) {
		// Check if we're leaving to a child element
		const relatedTarget = event.relatedTarget as HTMLElement
		const currentTarget = event.currentTarget as HTMLElement
		if (currentTarget.contains(relatedTarget)) return

		previewInsertIndex.value = null
		setDropTarget(null)
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		const dragged = draggedCard.value
		if (!dragged) return

		// Tokens cannot be added to hand - they just get removed
		if (dragged.isToken) {
			draggedFromHandIndex.value = null
			previewInsertIndex.value = null
			recordDrop('hand') // Record where the drop occurred
			setDropTarget(null)
			return dragged
		}

		const insertAt = previewInsertIndex.value ?? cards.value.length

		// If from hand, we need to handle reordering
		if (dragged.source === 'hand' && dragged.sourceIndex !== undefined) {
			const newCards = [...cards.value]
			// Remove from original position
			newCards.splice(dragged.sourceIndex, 1)
			// Adjust insert index if needed
			const adjustedIndex = insertAt > dragged.sourceIndex ? insertAt - 1 : insertAt
			// Insert at new position
			newCards.splice(adjustedIndex, 0, dragged.card)
			cards.value = newCards
		} else {
			// From other source, just insert
			const newCards = [...cards.value]
			newCards.splice(insertAt, 0, dragged.card)
			cards.value = newCards
		}

		draggedFromHandIndex.value = null
		previewInsertIndex.value = null
		recordDrop('hand') // Record where the drop occurred
		setDropTarget(null)

		return dragged // Return for source cleanup
	}

	function removeCard(index: number): TCardData | null {
		if (index < 0 || index >= cards.value.length) return null
		const card = cards.value[index]
		cards.value = cards.value.filter((_, i) => i !== index)
		return card
	}

	// Get cards to display (with ghost for dragged card)
	function getDisplayCards() {
		const dragged = draggedCard.value
		return cards.value.map((card, index) => ({
			card,
			index,
			isGhost:
				dragged?.source === 'hand' && dragged.sourceIndex === index && isDragging.value,
		}))
	}

	return {
		draggedFromHandIndex: computed(() => draggedFromHandIndex.value),
		previewInsertIndex: computed(() => previewInsertIndex.value),
		handleCardDragStart,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		removeCard,
		getDisplayCards,
	}
}

// Hook for managing play area
export function usePlayArea(cards: Ref<TPlayAreaCard[]>) {
	const {startDrag, draggedCard, setDropTarget, isDragging, recordDrop, sharedDragOffset} =
		useDeckTestDragDrop()

	const draggedCardInstanceId = ref<string | null>(null)
	const dragOffset = ref({x: 0, y: 0})
	const draggedCardRotated = ref(false)

	// Card dimensions
	const CARD_WIDTH = 118
	const CARD_HEIGHT = 172

	function handleCardDragStart(event: DragEvent, playAreaCard: TPlayAreaCard) {
		draggedCardInstanceId.value = playAreaCard.instanceId
		draggedCardRotated.value = playAreaCard.rotated
		startDrag(playAreaCard.card, 'playArea', undefined, event, undefined, playAreaCard.isToken)

		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()

		if (playAreaCard.rotated) {
			// For rotated cards, the visual bbox is swapped (172x118)
			// We need to track offset relative to the CENTER of the card
			// because rotation happens around the center
			const visualCenterX = rect.left + rect.width / 2
			const visualCenterY = rect.top + rect.height / 2
			// Store offset from cursor to visual center
			dragOffset.value = {
				x: event.clientX - visualCenterX,
				y: event.clientY - visualCenterY,
			}

			// Create a properly rotated drag image
			createRotatedDragImage(event, target)
		} else {
			// For non-rotated cards, simple corner offset works
			dragOffset.value = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			}
		}
	}

	function createRotatedDragImage(event: DragEvent, element: HTMLElement) {
		// Find the image element to create a rotated drag ghost
		const img = element.querySelector('img') as HTMLImageElement
		if (!img || !event.dataTransfer) return

		// Create a canvas to draw the rotated image
		const canvas = document.createElement('canvas')
		// Rotated dimensions: swap width and height
		canvas.width = CARD_HEIGHT
		canvas.height = CARD_WIDTH

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		// Rotate around center and draw
		ctx.translate(canvas.width / 2, canvas.height / 2)
		ctx.rotate(Math.PI / 2) // 90 degrees
		ctx.drawImage(img, -CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT)

		// Create an image from the canvas for the drag ghost
		const dragImg = new Image()
		dragImg.src = canvas.toDataURL()

		// Position off-screen and add to DOM (required for setDragImage)
		dragImg.style.position = 'absolute'
		dragImg.style.left = '-9999px'
		document.body.appendChild(dragImg)

		// Calculate offset: where on the visual rotated card the cursor is
		const elementRect = element.getBoundingClientRect()
		const offsetX = event.clientX - elementRect.left
		const offsetY = event.clientY - elementRect.top

		event.dataTransfer.setDragImage(dragImg, offsetX, offsetY)

		// Clean up after drag starts
		setTimeout(() => document.body.removeChild(dragImg), 0)
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault()
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move'
		}
		setDropTarget('playArea')
	}

	function handleDragLeave(event: DragEvent) {
		const relatedTarget = event.relatedTarget as HTMLElement
		const currentTarget = event.currentTarget as HTMLElement
		if (currentTarget.contains(relatedTarget)) return
		setDropTarget(null)
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault()
		const dragged = draggedCard.value

		if (!dragged) return

		// Calculate position relative to play area
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()

		let x: number
		let y: number

		if (dragged.source === 'playArea' && draggedCardRotated.value) {
			// For rotated cards, we stored offset from cursor to visual center
			// Now we need to calculate the CSS left/top from the visual center position
			const visualCenterX = event.clientX - rect.left - dragOffset.value.x
			const visualCenterY = event.clientY - rect.top - dragOffset.value.y

			// CSS left/top is where the unrotated top-left corner would be
			// For a card with center at (cx, cy), unrotated top-left is (cx - w/2, cy - h/2)
			x = visualCenterX - CARD_WIDTH / 2
			y = visualCenterY - CARD_HEIGHT / 2

			// Clamp using visual dimensions (which are swapped for rotated cards)
			// The visual bounding box after rotation is CARD_HEIGHT x CARD_WIDTH
			const visualWidth = CARD_HEIGHT
			const visualHeight = CARD_WIDTH
			// The center needs to stay within bounds such that the visual bbox fits
			const minCenterX = visualWidth / 2
			const maxCenterX = rect.width - visualWidth / 2
			const minCenterY = visualHeight / 2
			const maxCenterY = rect.height - visualHeight / 2

			const clampedCenterX = Math.max(minCenterX, Math.min(visualCenterX, maxCenterX))
			const clampedCenterY = Math.max(minCenterY, Math.min(visualCenterY, maxCenterY))

			x = clampedCenterX - CARD_WIDTH / 2
			y = clampedCenterY - CARD_HEIGHT / 2
		} else if (dragged.source === 'playArea') {
			// Non-rotated card from play area - simple offset from corner
			x = event.clientX - rect.left - dragOffset.value.x
			y = event.clientY - rect.top - dragOffset.value.y

			// Clamp to boundaries
			x = Math.max(0, Math.min(x, rect.width - CARD_WIDTH))
			y = Math.max(0, Math.min(y, rect.height - CARD_HEIGHT))
		} else {
			// Card from other source - use the shared drag offset from where user grabbed the card
			x = event.clientX - rect.left - sharedDragOffset.value.x
			y = event.clientY - rect.top - sharedDragOffset.value.y

			// Clamp to boundaries
			x = Math.max(0, Math.min(x, rect.width - CARD_WIDTH))
			y = Math.max(0, Math.min(y, rect.height - CARD_HEIGHT))
		}

		if (dragged.source === 'playArea') {
			// Move existing card to the end of the array (so it renders on top)
			// and update its position
			const movedCard = cards.value.find((c) => c.instanceId === draggedCardInstanceId.value)
			if (movedCard) {
				cards.value = [
					...cards.value.filter((c) => c.instanceId !== draggedCardInstanceId.value),
					{...movedCard, x, y},
				]
			}
		} else {
			// Add new card to play area
			const newCard: TPlayAreaCard = {
				card: dragged.card,
				instanceId: generateInstanceId(),
				x,
				y,
				faceDown: false,
				rotated: false,
			}
			cards.value = [...cards.value, newCard]
		}

		draggedCardInstanceId.value = null
		draggedCardRotated.value = false
		dragOffset.value = {x: 0, y: 0}
		recordDrop('playArea') // Record where the drop occurred
		setDropTarget(null)

		return dragged
	}

	function removeCard(instanceId: string): TPlayAreaCard | null {
		const card = cards.value.find((c) => c.instanceId === instanceId)
		if (!card) return null
		cards.value = cards.value.filter((c) => c.instanceId !== instanceId)
		return card
	}

	function toggleFaceDown(instanceId: string) {
		cards.value = cards.value.map((c) =>
			c.instanceId === instanceId ? {...c, faceDown: !c.faceDown} : c
		)
	}

	function toggleRotation(instanceId: string) {
		cards.value = cards.value.map((c) =>
			c.instanceId === instanceId ? {...c, rotated: !c.rotated} : c
		)
	}

	// Get cards to display (with ghost for dragged card)
	function getDisplayCards() {
		const dragged = draggedCard.value
		return cards.value.map((playAreaCard) => ({
			...playAreaCard,
			isGhost:
				dragged?.source === 'playArea' &&
				draggedCardInstanceId.value === playAreaCard.instanceId &&
				isDragging.value,
		}))
	}

	return {
		draggedCardInstanceId: computed(() => draggedCardInstanceId.value),
		handleCardDragStart,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		removeCard,
		toggleFaceDown,
		toggleRotation,
		getDisplayCards,
	}
}
