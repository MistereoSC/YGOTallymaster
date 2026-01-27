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

const searchQuery = ref('')
const filteredDeckList = computed(() => {
	if (!searchQuery.value) {
		return deckList.value
	}
	return deckList.value.filter((deck) => deck.name.toLowerCase().includes(searchQuery.value))
})

async function onCreateDeck(name: string) {
	const uniqueName = _getUniqueName(name)
	await createDeck(uniqueName)
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
		if (activeDeckForAction.value.name === newName) {
			onDeckRenameCancel()
			return
		}
		const uniqueName = _getUniqueName(newName)
		await renameDeck(activeDeckForAction.value.name, uniqueName)
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

function onDeckClone(deck: TDeckData) {
	const uniqueName = _getUniqueName(`${deck.name} (Copy)`)
	createDeck(uniqueName, {...deck, name: uniqueName})
}

function _getUniqueName(name: string): string {
	let uniqueName = name
	let counter = 1
	while (deckList.value.map((deck) => deck.name).includes(uniqueName)) {
		uniqueName = `${name} (${counter})`
		counter++
	}
	return uniqueName
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
			class="h-12 w-full px-4 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
		>
			<div class="flex items-center gap-3 flex-1">
				<div class="flex gap-3 items-center w-24">
					<div class="flex flex-col">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">Decks</h2>
						<p class="text-xs text-contrast-500">
							<span class="font-medium">{{ deckList.length }}</span>
							decks
						</p>
					</div>
				</div>

				<!-- Search Field -->
				<div class="relative ml-4 flex-1 max-w-xs">
					<Icon
						icon="material-symbols:search-rounded"
						class="absolute left-2.5 top-1/2 -translate-y-1/2 text-contrast-500 text-lg"
					/>
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search decks..."
						class="w-full bg-primary-800 text-contrast-700 placeholder-contrast-500 rounded-md pl-9 pr-3 py-1.5 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors"
					/>
					<button
						v-if="searchQuery"
						@click="searchQuery = ''"
						class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
					>
						<Icon icon="material-symbols:close-rounded" class="text-lg" />
					</button>
				</div>
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
					@clone="() => onDeckClone(deck)"
				/>
				<div
					class="w-56 h-77 grid grid-rows-2 gap-2 place-items-center"
					v-if="!searchQuery && deckList.length < 200"
				>
					<NameInputModal item-type="Deck" @confirm="(name) => onCreateDeck(name)">
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
		:existing-name="activeDeckForAction?.name"
		item-type="Deck"
		@confirm="(newName) => onDeckRenameConfirm(newName)"
		@close="onDeckRenameCancel"
	/>
</template>

<style lang="scss" scoped></style>
