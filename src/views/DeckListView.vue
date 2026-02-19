<script lang="ts" setup>
import DeckFolderList from '@/components/decks/DeckFolderList.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData, TDeckFolder} from '@/libs/Decks'
import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import DeckCreation from '@/components/decks/DeckCreation.vue'
import Spinner from '@/components/common/Spinner.vue'
import {Icon} from '@iconify/vue'
import Button from '@/components/common/Button.vue'
import NameInputModal from '@/components/common/NameInputModal.vue'

const {
	initialized,
	deckFolders,
	createDeck,
	deleteDeck,
	renameDeck,
	moveDeck,
	createFolder,
	deleteFolder,
	renameFolder,
	getDeckCount,
	DEFAULT_DECK_FOLDER,
} = useDeckList()

onBeforeMount(async () => {
	await getFullCardList()
})

const searchQuery = ref('')
const sortBy = ref<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'>('date_asc')

enum ESortBy {
	'date_asc' = 'Date (Old-New)',
	'date_desc' = 'Date (New-Old)',
	'name_asc' = 'Name (A-Z)',
	'name_desc' = 'Name (Z-A)',
}

const activeDeck = ref<null | {folderName: string; deck: TDeckData}>(null)

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

function onCreateFolder(folderName: string) {
	const uniqueName = _getUniqueFolderName(folderName)
	createFolder(uniqueName)
}

function onRenameFolder(folder: TDeckFolder, newName: string) {
	if (folder.name === newName) return
	const uniqueName = _getUniqueFolderName(newName)
	renameFolder(folder.name, uniqueName)
}

function onCloneDeck(folderName: string, deck: TDeckData) {
	createDeck(deck.name, deck, folderName)
}

function onMoveDeck(folderName: string, deck: TDeckData, targetFolder: string) {
	moveDeck(deck.name, folderName, targetFolder)
}

function _getUniqueFolderName(baseName: string): string {
	let uniqueName = baseName
	let counter = 1
	const existingNames = deckFolders.value.map((f) => f.name)
	while (existingNames.includes(uniqueName)) {
		uniqueName = `${baseName} (${counter})`
		counter++
	}
	return uniqueName
}

const totalDeckCount = computed(() => getDeckCount())

// Filter out empty Default folder for display
const visibleFolders = computed(() => {
	return deckFolders.value.filter(
		(folder) => folder.name !== DEFAULT_DECK_FOLDER || folder.decks.length > 0
	)
})

// Include Default folder as a move target even when empty
const allFoldersForMove = computed(() => {
	const hasDefaultFolder = deckFolders.value.some((f) => f.name === DEFAULT_DECK_FOLDER)
	if (hasDefaultFolder) {
		return deckFolders.value
	}
	// Add a virtual Default folder for move targets
	return [{name: DEFAULT_DECK_FOLDER, decks: []}, ...deckFolders.value]
})
</script>

<template>
	<div class="w-full h-full overflow-hidden flex flex-col">
		<div v-if="initialized !== 'ready'" class="w-full h-full grid place-content-center">
			<Spinner />
		</div>
		<div v-else-if="activeDeck" class="h-full relative overflow-hidden">
			<DeckCreation
				:deck-data="activeDeck.deck"
				:folder-name="activeDeck.folderName"
				@close="activeDeck = null"
			/>
		</div>
		<template v-else-if="visibleFolders.length > 0">
			<!-- Page Header -->
			<div
				class="h-12 w-full px-4 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
			>
				<div class="flex items-center gap-3 flex-1">
					<div class="flex flex-col w-24">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">Decks</h2>
						<p class="text-xs text-contrast-500">
							<span class="font-medium">{{ totalDeckCount }}</span>
							decks
						</p>
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
							class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
						>
							<Icon icon="material-symbols:close-rounded" class="text-lg" />
						</button>
					</div>

					<!-- Sort Dropdown -->
					<div class="relative">
						<select
							v-model="sortBy"
							class="bg-primary-800 text-contrast-700 rounded-md px-3 py-1.5 pr-8 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors appearance-none cursor-pointer"
						>
							<option v-for="(label, key) in ESortBy" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
						<Icon
							icon="material-symbols:arrow-drop-down-rounded"
							class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 pointer-events-none text-xl"
						/>
					</div>
				</div>
				<div v-if="deckFolders.length < 256" class="ml-3">
					<NameInputModal
						@confirm="(newName) => onCreateFolder(newName)"
						item-type="Folder"
					>
						<template #trigger>
							<Button
								icon="material-symbols:create-new-folder-rounded"
								label="New Folder"
								size="small"
							/>
						</template>
					</NameInputModal>
				</div>
			</div>

			<!-- Search Info Banner -->
			<div
				v-if="searchQuery && searchQuery.trim()"
				class="px-4 py-2 bg-secondary-600/20 border-b border-secondary-500/30 flex items-center gap-2 text-sm text-contrast-600 shrink-0"
			>
				<Icon icon="material-symbols:info-outline-rounded" class="text-lg" />
				<span>
					Showing search results. "Create Deck" buttons are hidden while searching.
					<button
						@click="searchQuery = ''"
						class="cursor-pointer ml-2 text-accent-400 hover:text-accent-300 underline transition-colors"
					>
						Clear search
					</button>
				</span>
			</div>

			<!-- Folders List -->
			<div class="flex flex-col flex-1 overflow-y-scroll scrollable">
				<div v-for="folder in visibleFolders" :key="folder.name">
					<DeckFolderList
						:folder="folder"
						:search-query="searchQuery"
						:sort-by="sortBy"
						:all-folders="allFoldersForMove"
						@create-deck="(deckName) => createDeck(deckName, undefined, folder.name)"
						@import-deck="(deck) => createDeck(deck.name, deck, folder.name)"
						@click-deck="(deck) => (activeDeck = {folderName: folder.name, deck})"
						@delete-deck="(deck) => deleteDeck(deck.name, folder.name)"
						@rename-deck="
							(deck, newName) => renameDeck(deck.name, newName, folder.name)
						"
						@move-deck="
							(deck, targetFolder) => onMoveDeck(folder.name, deck, targetFolder)
						"
						@delete-folder="() => deleteFolder(folder.name)"
						@rename-folder="(_, newName) => onRenameFolder(folder, newName)"
						@clone-deck="(newDeck) => onCloneDeck(folder.name, newDeck)"
					/>
				</div>
			</div>
		</template>
		<div v-else class="flex flex-col items-center justify-center h-full gap-2">
			<div
				class="w-16 h-16 rounded-2xl bg-tertiary-500/20 flex items-center justify-center mb-2"
			>
				<Icon
					icon="material-symbols:credit-card-off-rounded"
					class="text-tertiary-400 text-4xl"
				/>
			</div>
			<p class="text-lg font-medium text-contrast-700">No decks found</p>
			<p class="text-sm text-contrast-500">Let's start by creating your first deck</p>
			<div class="mt-2">
				<NameInputModal
					@confirm="(newName) => createDeck(newName, undefined, DEFAULT_DECK_FOLDER)"
					item-type="Deck"
				>
					<template #trigger>
						<Button icon="material-symbols:add-rounded" label="Create Deck" />
					</template>
				</NameInputModal>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
