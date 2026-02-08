<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {TDeckCardsPopulated} from '@/libs/Decks'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import {ref, computed, onMounted, onUnmounted} from 'vue'

const props = defineProps<{
	open: boolean
	enableCloseOnClickOutside?: boolean
}>()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'apply', cards: TDeckCardsPopulated): void
}>()

const MAIN_DECK_LIMIT = 60
const EXTRA_DECK_LIMIT = 15
const SIDE_DECK_LIMIT = 15

type TImportStage = 'paste' | 'results'
const stage = ref<TImportStage>('paste')
const decklistText = ref('')
const isProcessing = ref(false)

const addedCards = ref<TDeckCardsPopulated>({main: [], extra: [], side: []})
const notAddedCards = ref<{name: string; reason: string; section: string}[]>([])

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

interface TParsedEntry {
	count: number
	name: string
	section: 'main' | 'extra' | 'side'
}

function parseDecklistText(text: string): TParsedEntry[] {
	const lines = text.split('\n').map((line) => line.trim())
	const entries: TParsedEntry[] = []
	let currentSection: 'main' | 'extra' | 'side' = 'main'

	for (const line of lines) {
		if (!line) continue

		// Check for section headers
		const lowerLine = line.toLowerCase()
		if (lowerLine.includes('main deck') || lowerLine.startsWith('main')) {
			currentSection = 'main'
			continue
		}
		if (lowerLine.includes('extra deck') || lowerLine.startsWith('extra')) {
			currentSection = 'extra'
			continue
		}
		if (lowerLine.includes('side deck') || lowerLine.startsWith('side')) {
			currentSection = 'side'
			continue
		}

		// Parse card entry (e.g., "3x Card Name" or "1x Card Name")
		const match = line.match(/^(\d+)x?\s+(.+)$/i)
		if (match) {
			const count = parseInt(match[1], 10)
			const name = match[2].trim()
			entries.push({count, name, section: currentSection})
		}
	}

	return entries
}

// Find card by name (case-insensitive)
function findCardByName(name: string, cardList: TCardData[]): TCardData | null {
	const lowerName = name.toLowerCase()
	return cardList.find((card) => card.name.toLowerCase() === lowerName) || null
}

async function processDecklist() {
	isProcessing.value = true

	// Reset results
	addedCards.value = {main: [], extra: [], side: []}
	notAddedCards.value = []

	const entries = parseDecklistText(decklistText.value)
	const cardList = await getFullCardList()

	// Track counts for each section
	const counts = {main: 0, extra: 0, side: 0}
	// Track per-card copies in each section (max 3 per card per section)
	const cardCopies = {
		main: new Map<number, number>(),
		extra: new Map<number, number>(),
		side: new Map<number, number>(),
	}

	for (const entry of entries) {
		const card = findCardByName(entry.name, cardList)

		if (!card) {
			// Card not found
			for (let i = 0; i < entry.count; i++) {
				notAddedCards.value.push({
					name: entry.name,
					reason: 'Card not found in database',
					section: entry.section,
				})
			}
			continue
		}

		// Determine which section this card should go to
		let targetSection = entry.section

		// For main/extra sections, auto-correct based on card type
		if (entry.section === 'main' && isExtraDeckCard(card)) {
			targetSection = 'extra'
		} else if (entry.section === 'extra' && !isExtraDeckCard(card)) {
			targetSection = 'main'
		}

		// Get the appropriate limit
		const limit =
			targetSection === 'main'
				? MAIN_DECK_LIMIT
				: targetSection === 'extra'
					? EXTRA_DECK_LIMIT
					: SIDE_DECK_LIMIT

		// Add cards up to the limit
		for (let i = 0; i < entry.count; i++) {
			const currentCardCopies = cardCopies[targetSection].get(card.id) || 0

			if (currentCardCopies >= 3) {
				notAddedCards.value.push({
					name: entry.name,
					reason: `Maximum 3 copies per card in ${targetSection} deck`,
					section: targetSection,
				})
			} else if (counts[targetSection] >= limit) {
				notAddedCards.value.push({
					name: entry.name,
					reason: `${targetSection.charAt(0).toUpperCase() + targetSection.slice(1)} deck limit (${limit}) exceeded`,
					section: targetSection,
				})
			} else {
				addedCards.value[targetSection].push(card)
				counts[targetSection]++
				cardCopies[targetSection].set(card.id, currentCardCopies + 1)
			}
		}
	}

	isProcessing.value = false
	stage.value = 'results'
}

function onConfirmPaste() {
	if (!decklistText.value.trim()) return
	processDecklist()
}

function onApply() {
	emit('apply', addedCards.value)
	resetModal()
}

function onCancel() {
	emit('cancel')
	resetModal()
}

function resetModal() {
	stage.value = 'paste'
	decklistText.value = ''
	addedCards.value = {main: [], extra: [], side: []}
	notAddedCards.value = []
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.open) {
		onCancel()
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydown)
})

// Computed summaries
const totalAdded = computed(() => {
	return (
		addedCards.value.main.length + addedCards.value.extra.length + addedCards.value.side.length
	)
})

const addedSummary = computed(() => {
	const sections: string[] = []
	if (addedCards.value.main.length > 0) {
		sections.push(`Main: ${addedCards.value.main.length}`)
	}
	if (addedCards.value.extra.length > 0) {
		sections.push(`Extra: ${addedCards.value.extra.length}`)
	}
	if (addedCards.value.side.length > 0) {
		sections.push(`Side: ${addedCards.value.side.length}`)
	}
	return sections.join(', ')
})

// Group added cards for display
const groupedAddedCards = computed(() => {
	const groups: {section: string; cards: {card: TCardData; count: number}[]}[] = []

	for (const section of ['main', 'extra', 'side'] as const) {
		const sectionCards = addedCards.value[section]
		if (sectionCards.length === 0) continue

		// Count occurrences
		const countMap = new Map<number, {card: TCardData; count: number}>()
		for (const card of sectionCards) {
			if (countMap.has(card.id)) {
				countMap.get(card.id)!.count++
			} else {
				countMap.set(card.id, {card, count: 1})
			}
		}

		groups.push({
			section: section.charAt(0).toUpperCase() + section.slice(1) + ' Deck',
			cards: Array.from(countMap.values()),
		})
	}

	return groups
})

function onClickOutside() {
	if (props.enableCloseOnClickOutside) {
		onCancel()
	}
}
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="props.open"
				class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm"
				@click.self="onClickOutside"
			>
				<div
					class="w-full max-w-2xl bg-primary-800 p-5 rounded-xl border border-primary-600 shadow-2xl max-h-[80vh] flex flex-col"
				>
					<!-- Paste Stage -->
					<template v-if="stage === 'paste'">
						<h2 class="text-lg font-semibold text-contrast-700 mb-2">
							<Icon
								icon="material-symbols:content-paste-rounded"
								class="inline mr-2"
							/>
							Paste Decklist
						</h2>

						<!-- Warning -->
						<div
							class="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-2 mb-4"
						>
							<Icon
								icon="material-symbols:info-rounded"
								class="text-blue-400 text-xl shrink-0"
							/>
							<span class="text-sm text-blue-200">
								Only english card names are supported.
							</span>
						</div>
						<div
							class="flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 rounded-lg px-3 py-2 mb-4"
						>
							<Icon
								icon="material-symbols:warning-rounded"
								class="text-amber-400 text-xl shrink-0"
							/>
							<span class="text-sm text-amber-200">
								The current decklist will be overwritten when you apply the import.
							</span>
						</div>

						<div class="text-sm text-contrast-500 mb-3">
							Paste your decklist below. Supported format:
							<code class="bg-primary-700 px-1 rounded text-xs">3x Card Name</code>
						</div>

						<textarea
							v-model="decklistText"
							class="w-full min-h-[40vh] bg-primary-700 border border-primary-500 rounded-lg p-3 text-contrast-600 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 placeholder:text-contrast-400 scrollable"
							placeholder="Main Deck (40)
3x Card Name
2x Another Card
...

Extra Deck (15)
3x Fusion Monster

Side Deck (15)
1x Side Card"
						></textarea>

						<div class="flex justify-end gap-3 mt-4">
							<Button
								label="Cancel"
								size="small"
								variant="transparent"
								@click="onCancel"
							/>
							<Button
								label="Parse Decklist"
								size="small"
								:disabled="!decklistText.trim() || isProcessing"
								@click="onConfirmPaste"
							/>
						</div>
					</template>

					<!-- Results Stage -->
					<template v-else-if="stage === 'results'">
						<h2 class="text-lg font-semibold text-contrast-700 mb-4">
							<Icon icon="material-symbols:checklist-rounded" class="inline mr-2" />
							Import Results
						</h2>

						<div class="flex-1 overflow-y-auto scrollable space-y-4">
							<!-- Cards Added -->
							<div v-if="totalAdded > 0">
								<div class="flex items-center gap-2 mb-2">
									<Icon
										icon="material-symbols:check-circle-rounded"
										class="text-green-400"
									/>
									<span class="font-medium text-contrast-600">
										Cards to be added ({{ totalAdded }})
									</span>
									<span class="text-sm text-contrast-400">{{
										addedSummary
									}}</span>
								</div>

								<div
									class="bg-primary-700/50 rounded-lg p-3 min-h-[40vh] max-h-[75vh] overflow-y-auto scrollable"
								>
									<template
										v-for="group in groupedAddedCards"
										:key="group.section"
									>
										<div class="text-xs font-semibold text-accent-400 mb-1">
											{{ group.section }}
										</div>
										<div class="grid grid-cols-2 gap-1 mb-2">
											<div
												v-for="item in group.cards"
												:key="item.card.id"
												class="text-sm text-contrast-500 truncate"
											>
												{{ item.count }}x {{ item.card.name }}
											</div>
										</div>
									</template>
								</div>
							</div>

							<!-- Cards Not Added -->
							<div v-if="notAddedCards.length > 0">
								<div class="flex items-center gap-2 mb-2">
									<Icon
										icon="material-symbols:error-rounded"
										class="text-red-400"
									/>
									<span class="font-medium text-contrast-600">
										Cards not added ({{ notAddedCards.length }})
									</span>
								</div>

								<div
									class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 max-h-48 overflow-y-auto scrollable"
								>
									<div
										v-for="(item, index) in notAddedCards"
										:key="index"
										class="text-sm text-contrast-500 py-0.5"
									>
										<span class="text-red-300">{{ item.name }}</span>
										<span class="text-contrast-400 text-xs ml-2"
											>- {{ item.reason }}</span
										>
									</div>
								</div>
							</div>

							<!-- No cards parsed -->
							<div v-if="totalAdded === 0 && notAddedCards.length === 0">
								<div class="flex items-center gap-2 text-amber-400">
									<Icon icon="material-symbols:info-rounded" />
									<span>No cards were found in the pasted text.</span>
								</div>
							</div>
						</div>

						<div
							class="flex justify-between gap-3 mt-4 pt-3 border-t border-primary-600"
						>
							<Button
								label="Back"
								size="small"
								variant="transparent"
								icon="material-symbols:arrow-back-rounded"
								@click="stage = 'paste'"
							/>
							<div class="flex gap-3">
								<Button
									label="Cancel"
									size="small"
									variant="transparent"
									@click="onCancel"
								/>
								<Button
									label="Apply"
									size="small"
									:disabled="totalAdded === 0"
									@click="onApply"
								/>
							</div>
						</div>
					</template>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>
