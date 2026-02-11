<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import {TDeckCardsPopulated} from '@/libs/Decks'
import {computed, onMounted, ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import DeckTestHand from './DeckTestHand.vue'
import DeckTestDeck from './DeckTestDeck.vue'
import DeckTestPlayArea from './DeckTestPlayArea.vue'
import {TPlayAreaCard, TDragSource, generateInstanceId} from '@/composables/useDeckTestDragDrop'
import DeckTestDeckViewer from './DeckTestDeckViewer.vue'
import CardCompactView from '../database/CardCompactView.vue'
import CoinFlipModal from './CoinFlipModal.vue'
import DiceRollModal from './DiceRollModal.vue'

const props = defineProps<{
	deckData: TDeckCardsPopulated
	deckName: string
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()

onMounted(() => {
	mainDeckCards.value = shuffleDeck(props.deckData.main)
	extraDeckCards.value = props.deckData.extra
	drawCards(5)
})
function shuffleDeck(cards: TCardData[]) {
	const deck = [...cards]
	//shuffle the deckCards array
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[deck[i], deck[j]] = [deck[j], deck[i]]
	}

	return deck
}
function drawCards(n: number) {
	const drawnCards: TCardData[] = []
	for (let i = 0; i < n; i++) {
		if (mainDeckCards.value.length === 0) {
			break
		}
		const card = mainDeckCards.value.pop()!
		drawnCards.push(card)
	}
	handCards.value.push(...drawnCards)
	return drawnCards
}
function reset() {
	mainDeckCards.value = shuffleDeck(props.deckData.main)
	extraDeckCards.value = props.deckData.extra
	handCards.value = []
	playAreaCards.value = []
	graveyardCards.value = []
	banishedCards.value = []
	activeCardPreview.value = null
	viewedStack.value = null

	drawCards(5)
}

const mainDeckCards = ref<TCardData[]>([])
const extraDeckCards = ref<TCardData[]>([])
const handCards = ref<TCardData[]>([])
const graveyardCards = ref<TCardData[]>([])
const banishedCards = ref<TCardData[]>([])
const playAreaCards = ref<TPlayAreaCard[]>([])
const activeCardPreview = ref<TCardData | null>(null)

// Deck viewer state
const viewedStack = ref<TDragSource | null>(null)

const viewedStackCards = computed(() => {
	switch (viewedStack.value) {
		case 'mainDeck':
			return mainDeckCards.value
		case 'extraDeck':
			return extraDeckCards.value
		case 'graveyard':
			return graveyardCards.value
		case 'banishment':
			return banishedCards.value
		default:
			return []
	}
})

const viewedStackLabel = computed(() => {
	switch (viewedStack.value) {
		case 'mainDeck':
			return 'Main Deck'
		case 'extraDeck':
			return 'Extra Deck'
		case 'graveyard':
			return 'Graveyard'
		case 'banishment':
			return 'Banished'
		default:
			return ''
	}
})

function openStackViewer(stackName: TDragSource) {
	viewedStack.value = stackName
}

function closeStackViewer() {
	viewedStack.value = null
}

function removeCardFromViewedStack(index: number) {
	switch (viewedStack.value) {
		case 'mainDeck':
			mainDeckCards.value = mainDeckCards.value.filter((_, i) => i !== index)
			break
		case 'extraDeck':
			extraDeckCards.value = extraDeckCards.value.filter((_, i) => i !== index)
			break
		case 'graveyard':
			graveyardCards.value = graveyardCards.value.filter((_, i) => i !== index)
			break
		case 'banishment':
			banishedCards.value = banishedCards.value.filter((_, i) => i !== index)
			break
	}
}

// Handle card removal from source when dropped elsewhere
function handleCardRemovedFromPlayArea(data: {card: TCardData; instanceId: string}) {
	// Card was added to a stack from play area - remove from play area
	playAreaCards.value = playAreaCards.value.filter((c) => c.instanceId !== data.instanceId)
}

function handleCardRemovedFromHand(_data: {card: TCardData; index: number}) {
	// This is triggered when a card from another source is dropped on hand
	// The source removal is handled by the source component's onDragEnd
}

// === Deck Stack Context Menu Handlers ===
const deckFaceUp = ref<Record<TDragSource, boolean>>({
	mainDeck: false,
	extraDeck: false,
	graveyard: true,
	banishment: true,
	hand: false,
	playArea: false,
})

function handleShuffleDeck(stackName: TDragSource) {
	const shuffle = (cards: TCardData[]) => {
		const deck = [...cards]
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[deck[i], deck[j]] = [deck[j], deck[i]]
		}
		return deck
	}

	switch (stackName) {
		case 'mainDeck':
			mainDeckCards.value = shuffle(mainDeckCards.value)
			break
		case 'extraDeck':
			extraDeckCards.value = shuffle(extraDeckCards.value)
			break
		case 'graveyard':
			graveyardCards.value = shuffle(graveyardCards.value)
			break
		case 'banishment':
			banishedCards.value = shuffle(banishedCards.value)
			break
	}
}

function toggleDeckFaceUp(stackName: TDragSource) {
	deckFaceUp.value[stackName] = !deckFaceUp.value[stackName]
}

function discardTopFromStack(stackName: TDragSource) {
	let card: TCardData | undefined
	switch (stackName) {
		case 'mainDeck':
			card = mainDeckCards.value.pop()
			break
		case 'extraDeck':
			card = extraDeckCards.value.pop()
			break
		case 'banishment':
			card = banishedCards.value.pop()
			break
	}
	if (card) {
		graveyardCards.value.push(card)
	}
}

function banishTopFromStack(stackName: TDragSource) {
	let card: TCardData | undefined
	switch (stackName) {
		case 'mainDeck':
			card = mainDeckCards.value.pop()
			break
		case 'extraDeck':
			card = extraDeckCards.value.pop()
			break
		case 'graveyard':
			card = graveyardCards.value.pop()
			break
	}
	if (card) {
		banishedCards.value.push(card)
	}
}

function returnTuHandFromStack(stackName: TDragSource) {
	let card: TCardData | undefined
	switch (stackName) {
		case 'mainDeck':
			card = mainDeckCards.value.pop()
			break
		case 'extraDeck':
			card = extraDeckCards.value.pop()
			break
		case 'graveyard':
			card = graveyardCards.value.pop()
			break
		case 'banishment':
			card = banishedCards.value.pop()
			break
	}
	if (card) {
		if (isExtraDeckCard(card)) {
			extraDeckCards.value.push(card)
		} else {
			handCards.value.push(card)
		}
	}
}

function returnToDeckFromStack(stackName: TDragSource) {
	let card: TCardData | undefined
	switch (stackName) {
		case 'graveyard':
			card = graveyardCards.value.pop()
			break
		case 'banishment':
			card = banishedCards.value.pop()
			break
	}
	if (card) {
		if (isExtraDeckCard(card)) {
			extraDeckCards.value.push(card)
		} else {
			mainDeckCards.value.push(card)
		}
	}
}

function isExtraDeckCard(card: TCardData): boolean {
	const extraDeckTypes = [
		'fusion',
		'fusion_pendulum',
		'synchro',
		'synchro_pendulum',
		'xyz',
		'xyz_pendulum',
		'link',
	]
	return extraDeckTypes.includes(card.frameType)
}

// === Hand Context Menu Handlers ===
function discardCardFromHand(index: number) {
	const card = handCards.value[index]
	if (card) {
		handCards.value = handCards.value.filter((_, i) => i !== index)
		graveyardCards.value.push(card)
	}
}

function banishCardFromHand(index: number) {
	const card = handCards.value[index]
	if (card) {
		handCards.value = handCards.value.filter((_, i) => i !== index)
		banishedCards.value.push(card)
	}
}

function returnCardToDeckFromHand(index: number) {
	const card = handCards.value[index]
	if (card) {
		handCards.value = handCards.value.filter((_, i) => i !== index)
		mainDeckCards.value.push(card)
	}
}

// === Play Area Context Menu Handlers ===
function discardCardFromPlayArea(instanceId: string) {
	const playAreaCard = playAreaCards.value.find((c) => c.instanceId === instanceId)
	if (playAreaCard) {
		playAreaCards.value = playAreaCards.value.filter((c) => c.instanceId !== instanceId)
		// Tokens are removed completely, not added to graveyard
		if (!playAreaCard.isToken) {
			graveyardCards.value.push(playAreaCard.card)
		}
	}
}

function banishCardFromPlayArea(instanceId: string) {
	const playAreaCard = playAreaCards.value.find((c) => c.instanceId === instanceId)
	if (playAreaCard) {
		playAreaCards.value = playAreaCards.value.filter((c) => c.instanceId !== instanceId)
		// Tokens are removed completely, not added to banishment
		if (!playAreaCard.isToken) {
			banishedCards.value.push(playAreaCard.card)
		}
	}
}

function returnCardToDeckFromPlayArea(instanceId: string) {
	const playAreaCard = playAreaCards.value.find((c) => c.instanceId === instanceId)
	if (playAreaCard) {
		playAreaCards.value = playAreaCards.value.filter((c) => c.instanceId !== instanceId)
		// Tokens are removed completely, not returned to deck
		if (!playAreaCard.isToken) {
			if (isExtraDeckCard(playAreaCard.card)) {
				extraDeckCards.value.push(playAreaCard.card)
			} else {
				mainDeckCards.value.push(playAreaCard.card)
			}
		}
	}
}

function returnCardToHandFromPlayArea(instanceId: string) {
	const playAreaCard = playAreaCards.value.find((c) => c.instanceId === instanceId)
	if (playAreaCard) {
		playAreaCards.value = playAreaCards.value.filter((c) => c.instanceId !== instanceId)
		// Tokens are removed completely, not returned to hand
		if (!playAreaCard.isToken) {
			if (isExtraDeckCard(playAreaCard.card)) {
				extraDeckCards.value.push(playAreaCard.card)
			} else {
				handCards.value.push(playAreaCard.card)
			}
		}
	}
}

// === Play Area Bulk Actions ===
function discardAllFromPlayArea() {
	for (const playAreaCard of playAreaCards.value) {
		// Tokens are removed completely, not added to graveyard
		if (!playAreaCard.isToken) {
			graveyardCards.value.push(playAreaCard.card)
		}
	}
	playAreaCards.value = []
}

function banishAllFromPlayArea() {
	for (const playAreaCard of playAreaCards.value) {
		// Tokens are removed completely, not added to banishment
		if (!playAreaCard.isToken) {
			banishedCards.value.push(playAreaCard.card)
		}
	}
	playAreaCards.value = []
}

function moveAllToHandFromPlayArea() {
	for (const playAreaCard of playAreaCards.value) {
		// Tokens are removed completely, not returned to hand
		if (!playAreaCard.isToken) {
			if (isExtraDeckCard(playAreaCard.card)) {
				extraDeckCards.value.push(playAreaCard.card)
			} else {
				handCards.value.push(playAreaCard.card)
			}
		}
	}
	playAreaCards.value = []
}

function moveAllToDeckFromPlayArea() {
	for (const playAreaCard of playAreaCards.value) {
		// Tokens are removed completely, not returned to deck
		if (!playAreaCard.isToken) {
			if (isExtraDeckCard(playAreaCard.card)) {
				extraDeckCards.value.push(playAreaCard.card)
			} else {
				mainDeckCards.value.push(playAreaCard.card)
			}
		}
	}
	playAreaCards.value = []
}

// === Coin Flip & Dice Roll Modals ===
const coinFlipModalOpen = ref(false)
const diceRollModalOpen = ref(false)

// === Token Creation ===
function createToken() {
	// Create a placeholder card data for the token
	// Use type assertion since tokens don't need all card properties
	const tokenCard = {
		id: 0,
		name: 'Token',
		type: 'Token',
		frameType: 'token',
		humanReadableCardType: 'Token',
		desc: 'A token card.',
		ygoprodeck_url: '',
		race: '',
	} as TCardData

	const newToken: TPlayAreaCard = {
		card: tokenCard,
		instanceId: generateInstanceId(),
		x: 50 + Math.random() * 100,
		y: 50 + Math.random() * 100,
		faceDown: false,
		rotated: false,
		isToken: true,
	}

	playAreaCards.value = [...playAreaCards.value, newToken]
}
</script>

<template>
	<div class="w-full h-full grid grid-rows-[auto_1fr] overflow-auto">
		<!-- Header -->
		<div
			class="h-12 w-full flex justify-between pl-4 pr-2 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<span class="flex items-center gap-3">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="emit('close')"
					v-tooltip.bottom="'Return'"
				/>
				<h2 class="font-bold text-lg">{{ deckName }}</h2>
			</span>
			<span class="flex items-center gap-2">
				<Button
					size="small"
					@click="coinFlipModalOpen = true"
					label="Flip Coin"
					icon="mdi:circle-outline"
					v-tooltip.bottom="'Flip a Coin'"
				/>
				<Button
					size="small"
					@click="diceRollModalOpen = true"
					label="Roll Dice"
					icon="mdi:dice-6"
					v-tooltip.bottom="'Roll a Dice'"
				/>
				<Button
					size="small"
					@click="createToken"
					label="Token"
					icon="mdi:plus-circle"
					v-tooltip.bottom="'Create Token'"
				/>
				<Button
					size="small"
					@click="reset"
					label="Reset"
					icon="material-symbols:restart-alt-rounded"
				/>
			</span>
		</div>
		<!-- Content -->

		<div class="grid grid-cols-[1fr_auto] h-full overflow-hidden">
			<!-- Center -->
			<div class="grid grid-rows-[1fr_auto] h-full overflow-hidden">
				<!-- Top -->
				<div class="grid grid-cols-[auto_1fr] overflow-hidden">
					<!-- Card Details -->
					<div
						class="w-[30vw] min-w-96 max-w-lg h-full bg-primary-700 border-r border-primary-600 overflow-hidden"
					>
						<CardCompactView
							v-if="activeCardPreview"
							:card="activeCardPreview"
							:description-highlighting="true"
						/>
					</div>
					<!-- Play Area -->
					<div class="relative h-full bg-primary-800">
						<!-- PlayArea Component -->
						<DeckTestPlayArea
							v-model="playAreaCards"
							@card-hover="(card) => (activeCardPreview = card)"
							@card-removed="handleCardRemovedFromPlayArea"
							@discard-card="discardCardFromPlayArea"
							@banish-card="banishCardFromPlayArea"
							@return-to-deck="returnCardToDeckFromPlayArea"
							@return-to-hand="returnCardToHandFromPlayArea"
							@reset="reset"
							@discard-all="discardAllFromPlayArea"
							@banish-all="banishAllFromPlayArea"
							@move-all-to-hand="moveAllToHandFromPlayArea"
							@move-all-to-deck="moveAllToDeckFromPlayArea"
							@create-token="createToken"
						/>
						<!-- Graveyard (positioned absolutely over play area) -->
						<div class="absolute right-3 bottom-3 z-10">
							<DeckTestDeck
								v-model="graveyardCards"
								:face-up="deckFaceUp.graveyard"
								stack-name="graveyard"
								label="Graveyard"
								@card-hover="(card) => (activeCardPreview = card)"
								@click="openStackViewer('graveyard')"
								@shuffle="handleShuffleDeck('graveyard')"
								@toggle-face-up="toggleDeckFaceUp('graveyard')"
								@discard-top="discardTopFromStack('graveyard')"
								@banish-top="banishTopFromStack('graveyard')"
								@return-to-hand="returnTuHandFromStack('graveyard')"
								@return-to-deck="returnToDeckFromStack('graveyard')"
							/>
						</div>
						<!-- Banishment (positioned absolutely over play area) -->
						<div class="absolute right-3 bottom-50 z-10">
							<DeckTestDeck
								v-model="banishedCards"
								:face-up="deckFaceUp.banishment"
								stack-name="banishment"
								label="Banished"
								@card-hover="(card) => (activeCardPreview = card)"
								@click="openStackViewer('banishment')"
								@shuffle="handleShuffleDeck('banishment')"
								@toggle-face-up="toggleDeckFaceUp('banishment')"
								@discard-top="discardTopFromStack('banishment')"
								@banish-top="banishTopFromStack('banishment')"
								@return-to-hand="returnTuHandFromStack('banishment')"
								@return-to-deck="returnToDeckFromStack('banishment')"
							/>
						</div>
					</div>
				</div>
				<!-- Bottom -->
				<div
					class="w-full grid grid-cols-[auto_1fr_auto] gap-2 h-50 bg-primary-700 border-t border-primary-600"
				>
					<!-- Extra Deck -->
					<div class="h-full flex items-center px-2">
						<DeckTestDeck
							v-model="extraDeckCards"
							:face-up="deckFaceUp.extraDeck"
							stack-name="extraDeck"
							label="Extra Deck"
							@card-hover="(card) => (activeCardPreview = card)"
							@click="openStackViewer('extraDeck')"
							@shuffle="handleShuffleDeck('extraDeck')"
							@toggle-face-up="toggleDeckFaceUp('extraDeck')"
							@discard-top="discardTopFromStack('extraDeck')"
							@banish-top="banishTopFromStack('extraDeck')"
						/>
					</div>
					<!-- Hand -->
					<div class="w-full overflow-hidden">
						<DeckTestHand
							v-model="handCards"
							@card-hover="(card) => (activeCardPreview = card)"
							@card-removed="handleCardRemovedFromHand"
							@discard-card="discardCardFromHand"
							@banish-card="banishCardFromHand"
							@return-to-deck="returnCardToDeckFromHand"
						/>
					</div>
					<!-- Deck -->
					<div class="h-full flex items-center pr-4">
						<DeckTestDeck
							v-model="mainDeckCards"
							:face-up="deckFaceUp.mainDeck"
							stack-name="mainDeck"
							label="Main Deck"
							@card-hover="(card) => (activeCardPreview = card)"
							@click="openStackViewer('mainDeck')"
							@shuffle="handleShuffleDeck('mainDeck')"
							@toggle-face-up="toggleDeckFaceUp('mainDeck')"
							@discard-top="discardTopFromStack('mainDeck')"
							@banish-top="banishTopFromStack('mainDeck')"
							@return-to-hand="returnTuHandFromStack('mainDeck')"
						/>
					</div>
				</div>
			</div>

			<!-- Side-List -->
			<div
				class="w-32 h-full bg-primary-900 border-l border-primary-600 overflow-hidden scrollable"
			>
				<DeckTestDeckViewer
					:cards="viewedStackCards"
					:stack-name="viewedStack"
					:label="viewedStackLabel"
					@card-hover="(card) => (activeCardPreview = card)"
					@card-removed="removeCardFromViewedStack"
					@close="closeStackViewer"
				/>
			</div>
		</div>

		<!-- Modals -->
		<CoinFlipModal :open="coinFlipModalOpen" @close="coinFlipModalOpen = false" />
		<DiceRollModal :open="diceRollModalOpen" @close="diceRollModalOpen = false" />
	</div>
</template>

<style lang="scss" scoped></style>
