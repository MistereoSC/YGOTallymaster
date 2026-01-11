<script lang="ts" setup>
import DeckPreview from '@/components/decks/DeckPreview.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import DeckCreation from '@/components/decks/DeckCreation.vue'
import Spinner from '@/components/common/Spinner.vue'
import ConfirmCancelModal from '@/components/common/ConfirmCancelModal.vue'
import {Icon} from '@iconify/vue'
import Button from '@/components/common/Button.vue'
import NameInputModal from '@/components/common/NameInputModal.vue'
import DeckImportZone from '@/components/decks/DeckImportZone.vue'

const {initialized, deckList, createDeck, deleteDeck, renameDeck} = useDeckList()
onBeforeMount(async () => {
	await getFullCardList()
})

// Search functionality
const searchInput = ref('')
const searchQuery = ref('')
const DEBOUNCE_DELAY = 150
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		searchQuery.value = searchInput.value.trim().toLowerCase()
	}, DEBOUNCE_DELAY)
}

function onResetSearch() {
	searchInput.value = ''
	searchQuery.value = ''
}

const filteredDeckList = computed(() => {
	if (!searchQuery.value) {
		return deckList.value
	}
	return deckList.value.filter((deck) => deck.name.toLowerCase().includes(searchQuery.value))
})

async function onCreateDeck(name: string) {
	await createDeck(name)
}

const activeDeck = ref<null | TDeckData>(null)

const deckDeleteModalOpen = ref(false)
const deckRenameModalOpen = ref(false)

const activeDeckForAction = ref<null | TDeckData>(null)
function onDeckDelete(deck: TDeckData) {
	activeDeckForAction.value = deck
	deckDeleteModalOpen.value = true
}
function onDeckRename(deck: TDeckData) {
	activeDeckForAction.value = deck
	deckRenameModalOpen.value = true
}

function onDeckDeleteCancel() {
	deckDeleteModalOpen.value = false
	activeDeckForAction.value = null
}
function onDeckRenameCancel() {
	deckRenameModalOpen.value = false
	activeDeckForAction.value = null
}

async function onDeckDeleteConfirm() {
	if (activeDeckForAction.value) {
		await deleteDeck(activeDeckForAction.value.name)
	}
	onDeckDeleteCancel()
}

async function onDeckRenameConfirm(newName: string) {
	if (activeDeckForAction.value) {
		await renameDeck(activeDeckForAction.value.name, newName)
	}
	onDeckRenameCancel()
}

watch(activeDeck, (newValue, oldValue) => {
	if (newValue !== null && oldValue === null) {
		history.pushState({deckOpen: true}, '')
	}
})

const handlePopState = () => {
	if (activeDeck.value !== null) {
		activeDeck.value = null
	}
}

onMounted(() => {
	window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
	window.removeEventListener('popstate', handlePopState)
})

function onDeckImport(deck: TDeckData) {
	createDeck(deck.name, deck)
}
</script>

<template>
	<div v-if="activeDeck" class="relative h-full overflow-hidden">
		<DeckCreation :deck-data="activeDeck" @close="activeDeck = null" />
	</div>
	<div
		v-else-if="initialized && deckList.length === 0"
		class="flex flex-col items-center justify-center h-full gap-2"
	>
		<div class="w-16 h-16 rounded-2xl bg-tertiary-500/20 flex items-center justify-center mb-2">
			<Icon
				icon="material-symbols:credit-card-off-rounded"
				class="text-tertiary-400 text-4xl"
			/>
		</div>
		<p class="text-lg font-medium text-contrast-700">No decks found</p>
		<p class="text-sm text-contrast-500">Let's start by creating your first deck</p>
		<div class="mt-2">
			<NameInputModal @confirm="(name) => onCreateDeck(name)" item-type="Deck">
				<template #trigger>
					<Button icon="material-symbols:add-rounded" label="Create Deck" />
				</template>
			</NameInputModal>
		</div>
	</div>
	<div v-else-if="initialized" class="h-full flex flex-col overflow-hidden">
		<!-- Page Header -->
		<div
			class="w-full px-4 py-1 h-12 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
		>
			<div class="flex items-center gap-3">
				<div class="flex flex-col">
					<h1 class="font-semibold text-contrast-700">Decks</h1>
				</div>
			</div>

			<div class="flex gap-2 items-center">
				<Button
					v-if="searchInput"
					rounded
					icon="material-symbols:filter-alt-off-rounded"
					@click="onResetSearch"
					size="small"
				/>
				<input
					v-model="searchInput"
					@input="onSearchInput"
					type="text"
					placeholder="Search Decks..."
					class="w-56 px-2 py-1 rounded-md bg-primary-800 border border-primary-600 focus:outline-none focus:border-accent-500 placeholder:text-contrast-500"
				/>
			</div>
		</div>
		<!-- Deck Grid -->
		<div class="flex-1 overflow-auto scrollable p-6">
			<div
				v-if="filteredDeckList.length === 0 && searchQuery"
				class="flex flex-col items-center justify-center h-full gap-2"
			>
				<div
					class="w-16 h-16 rounded-2xl bg-tertiary-500/20 flex items-center justify-center mb-2"
				>
					<Icon
						icon="material-symbols:search-off-rounded"
						class="text-tertiary-400 text-4xl"
					/>
				</div>
				<p class="text-lg font-medium text-contrast-700">No decks found</p>
				<p class="text-sm text-contrast-500">
					No decks match your search for "{{ searchQuery }}"
				</p>
			</div>
			<div v-else class="flex flex-wrap gap-8">
				<DeckPreview
					v-for="deck in filteredDeckList"
					:key="deck.name"
					:deck-data="deck"
					@click="activeDeck = deck"
					@delete="() => onDeckDelete(deck)"
					@rename="() => onDeckRename(deck)"
				/>
				<div
					class="w-56 h-77 grid grid-rows-2 gap-2 place-items-center"
					v-if="!searchQuery && deckList.length < 200"
				>
					<NameInputModal
						:existing-items="deckList"
						item-type="Deck"
						@confirm="(name) => onCreateDeck(name)"
					>
						<template #trigger>
							<div
								class="h-full w-full rounded-lg bg-primary-700/50 cursor-pointer shadow-lg transition-all duration-200 hover:bg-primary-600/70 border-2 border-dashed border-primary-500 hover:border-accent-500/50 group"
							>
								<div
									class="select-none h-full w-full flex justify-center items-center flex-col"
								>
									<div
										class="w-8 h-8 rounded-full bg-primary-600 group-hover:bg-accent-500/20 flex items-center justify-center transition-colors"
									>
										<Icon
											icon="material-symbols:add-rounded"
											class="text-2xl text-contrast-500 group-hover:text-accent-400 transition-colors"
										/>
									</div>
									<span
										class="font-semibold text-contrast-500 group-hover:text-contrast-600 transition-colors"
									>
										Create Deck
									</span>
								</div>
							</div>
						</template>
					</NameInputModal>

					<DeckImportZone
						:existing-decks-names="deckList.map((deck) => deck.name)"
						@import-deck="(deck) => onDeckImport(deck)"
					/>
				</div>
			</div>
		</div>
	</div>

	<div v-else class="w-full h-full">
		<div class="w-full h-full flex flex-col justify-center items-center gap-4">
			<Spinner />
		</div>
	</div>

	<ConfirmCancelModal
		:open="deckDeleteModalOpen"
		heading-text="Delete Deck"
		cancel-text="Cancel"
		confirm-text="Delete"
		@cancel="onDeckDeleteCancel"
		@confirm="onDeckDeleteConfirm"
	>
		<template #content>
			<p>
				Are you sure you want to delete the deck "{{ activeDeckForAction?.name }}"? This
				action cannot be undone.
			</p>
		</template>
	</ConfirmCancelModal>

	<NameInputModal
		:open="deckRenameModalOpen"
		:existing-items="deckList"
		:existing-name="activeDeckForAction?.name"
		item-type="Deck"
		@confirm="(newName) => onDeckRenameConfirm(newName)"
		@close="onDeckRenameCancel"
	/>
</template>

<style lang="scss" scoped></style>
