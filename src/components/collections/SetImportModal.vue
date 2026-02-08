<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import {ref, computed, onMounted, onUnmounted} from 'vue'

const IMPORT_AMOUNT_LIMIT = 1000
const MAX_COPIES_PER_CARD = 3

const props = defineProps<{
	open: boolean
	existingCards: TCardData[]
	enableCloseOnClickOutside?: boolean
}>()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'apply', cards: TCardData[]): void
}>()

type TImportStage = 'paste' | 'results'
const stage = ref<TImportStage>('paste')
const cardlistText = ref('')
const isProcessing = ref(false)

const addedCards = ref<TCardData[]>([])
const notAddedCards = ref<{name: string; reason: string}[]>([])

interface TParsedEntry {
	count: number
	name: string
}

function parseCardlistText(text: string): TParsedEntry[] {
	const lines = text.split('\n').map((line) => line.trim())
	const entries: TParsedEntry[] = []

	for (const line of lines) {
		if (!line) continue

		// Skip section headers if user pastes deck format
		const lowerLine = line.toLowerCase()
		if (
			lowerLine.includes('main deck') ||
			lowerLine.includes('extra deck') ||
			lowerLine.includes('side deck') ||
			lowerLine.startsWith('main') ||
			lowerLine.startsWith('extra') ||
			lowerLine.startsWith('side')
		) {
			continue
		}

		// Parse card entry (e.g., "3x Card Name" or "1x Card Name")
		const match = line.match(/^(\d+)x?\s+(.+)$/i)
		if (match) {
			const count = parseInt(match[1], 10)
			const name = match[2].trim()
			entries.push({count, name})
		}
	}

	return entries
}

// Find card by name (case-insensitive)
function findCardByName(name: string, cardList: TCardData[]): TCardData | null {
	const lowerName = name.toLowerCase()
	return cardList.find((card) => card.name.toLowerCase() === lowerName) || null
}

async function processCardlist() {
	isProcessing.value = true

	// Reset results
	addedCards.value = []
	notAddedCards.value = []

	const entries = parseCardlistText(cardlistText.value)
	const cardList = await getFullCardList()

	// Count existing copies of each card in the set
	const existingCopies = new Map<number, number>()
	for (const card of props.existingCards) {
		existingCopies.set(card.id, (existingCopies.get(card.id) || 0) + 1)
	}

	// Track new copies being added
	const newCopies = new Map<number, number>()
	let totalNewCards = 0

	for (const entry of entries) {
		const card = findCardByName(entry.name, cardList)

		if (!card) {
			// Card not found
			for (let i = 0; i < entry.count; i++) {
				notAddedCards.value.push({
					name: entry.name,
					reason: 'Card not found in database',
				})
			}
			continue
		}

		// Add cards up to limits
		for (let i = 0; i < entry.count; i++) {
			const existingCount = existingCopies.get(card.id) || 0
			const newCount = newCopies.get(card.id) || 0
			const totalCopies = existingCount + newCount

			if (totalCopies >= MAX_COPIES_PER_CARD) {
				notAddedCards.value.push({
					name: entry.name,
					reason: `Maximum ${MAX_COPIES_PER_CARD} copies per card (${existingCount} already in set)`,
				})
			} else if (props.existingCards.length + totalNewCards >= IMPORT_AMOUNT_LIMIT) {
				notAddedCards.value.push({
					name: entry.name,
					reason: `Set limit (${IMPORT_AMOUNT_LIMIT}) exceeded`,
				})
			} else {
				addedCards.value.push(card)
				newCopies.set(card.id, newCount + 1)
				totalNewCards++
			}
		}
	}

	isProcessing.value = false
	stage.value = 'results'
}

function onConfirmPaste() {
	if (!cardlistText.value.trim()) return
	processCardlist()
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
	cardlistText.value = ''
	addedCards.value = []
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

const totalAdded = computed(() => addedCards.value.length)
const groupedAddedCards = computed(() => {
	const countMap = new Map<number, {card: TCardData; count: number}>()
	for (const card of addedCards.value) {
		if (countMap.has(card.id)) {
			countMap.get(card.id)!.count++
		} else {
			countMap.set(card.id, {card, count: 1})
		}
	}
	return Array.from(countMap.values())
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
							Paste Card List
						</h2>

						<!-- Info -->
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
							class="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-2 mb-4"
						>
							<Icon
								icon="material-symbols:info-rounded"
								class="text-blue-400 text-xl shrink-0"
							/>
							<span class="text-sm text-blue-200">
								Cards will be added to the current set (max 3 copies per card).
							</span>
						</div>

						<div class="text-sm text-contrast-500 mb-3">
							Paste your card list below. Supported format:
							<code class="bg-primary-700 px-1 rounded text-xs">3x Card Name</code>
						</div>

						<textarea
							v-model="cardlistText"
							class="w-full min-h-[40vh] bg-primary-700 border border-primary-500 rounded-lg p-3 text-contrast-600 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 placeholder:text-contrast-400 scrollable"
							placeholder="3x Card Name
2x Another Card
1x Some Other Card
..."
						></textarea>

						<div class="flex justify-end gap-3 mt-4">
							<Button
								label="Cancel"
								size="small"
								variant="transparent"
								@click="onCancel"
							/>
							<Button
								label="Parse Card List"
								size="small"
								:disabled="!cardlistText.trim() || isProcessing"
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
								</div>

								<div
									class="bg-primary-700/50 rounded-lg p-3 min-h-[40vh] max-h-[75vh] overflow-y-auto scrollable"
								>
									<div class="grid grid-cols-2 gap-1">
										<div
											v-for="item in groupedAddedCards"
											:key="item.card.id"
											class="text-sm text-contrast-500 truncate"
										>
											{{ item.count }}x {{ item.card.name }}
										</div>
									</div>
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
									label="Add Cards"
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
