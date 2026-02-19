<script lang="ts" setup>
import {TDeckData, TDeckFolder, DEFAULT_DECK_FOLDER} from '@/libs/Decks'
import DeckPreview from './DeckPreview.vue'
import ConfirmCancelModal from '@/components/common/ConfirmCancelModal.vue'
import {ref, computed} from 'vue'
import Button from '@/components/common/Button.vue'
import DropdownMenu from '@/components/collections/DropdownMenu.vue'
import {Icon} from '@iconify/vue'
import NameInputModal from '@/components/common/NameInputModal.vue'
import DeckImportZone from './DeckImportZone.vue'

const props = defineProps<{
	folder: TDeckFolder
	searchQuery?: string
	sortBy?:
		| 'date_desc'
		| 'date_asc'
		| 'name_asc'
		| 'name_desc'
	allFolders?: TDeckFolder[]
}>()
const emit = defineEmits<{
	(e: 'createDeck', name: string): void
	(e: 'importDeck', deck: TDeckData): void
	(e: 'cloneDeck', deck: TDeckData): void
	(e: 'deleteDeck', deck: TDeckData): void
	(e: 'renameDeck', deck: TDeckData, newName: string): void
	(e: 'moveDeck', deck: TDeckData, targetFolder: string): void
	(e: 'clickDeck', deck: TDeckData): void
	(e: 'deleteFolder', folder: TDeckFolder): void
	(e: 'renameFolder', folder: TDeckFolder, newName: string): void
}>()

// -----------------------------------------------------------------
// #region Collapse State
// -----------------------------------------------------------------

const isCollapsed = ref(false)

function toggleCollapse() {
	isCollapsed.value = !isCollapsed.value
}

// -----------------------------------------------------------------
// #region Filtered and Sorted Decks
// -----------------------------------------------------------------

const filteredAndSortedDecks = computed(() => {
	let decks = [...props.folder.decks]

	// Filter by search query
	if (props.searchQuery && props.searchQuery.trim()) {
		const query = props.searchQuery.toLowerCase()
		decks = decks.filter((deck) => deck.name.toLowerCase().includes(query))
	}

	// Sort decks
	if (props.sortBy === 'name_asc') {
		decks.sort((a, b) => a.name.localeCompare(b.name))
	} else if (props.sortBy === 'name_desc') {
		decks.sort((a, b) => b.name.localeCompare(a.name))
	} else if (props.sortBy === 'date_desc') {
		return decks.reverse()
	} else {
		// Default: keep original order (sorted by file creation date from file system)
	}

	return decks
})

const isSearching = computed(() => {
	return !!(props.searchQuery && props.searchQuery.trim())
})

const hasNoResults = computed(() => {
	return isSearching.value && filteredAndSortedDecks.value.length === 0
})

const isDefaultFolder = computed(() => props.folder.name === DEFAULT_DECK_FOLDER)

// -----------------------------------------------------------------
// #region Deck Actions
// -----------------------------------------------------------------

const activeActionForDeck = ref<null | TDeckData>(null)

const confirmRenameOpen = ref(false)
function onRenameDeck(deck: TDeckData) {
	activeActionForDeck.value = deck
	confirmRenameOpen.value = true
}

function onCancelRenameDeck() {
	activeActionForDeck.value = null
	confirmRenameOpen.value = false
}

const confirmDeleteOpen = ref(false)
function onDeleteDeck(deck: TDeckData) {
	activeActionForDeck.value = deck
	confirmDeleteOpen.value = true
}
function onCancelDeleteDeck() {
	activeActionForDeck.value = null
	confirmDeleteOpen.value = false
}

function onConfirmRenameDeck(newName: string) {
	if (activeActionForDeck.value) {
		if (activeActionForDeck.value.name === newName) {
			onCancelRenameDeck()
			return
		}
		const uniqueName = _getUniqueDeckName(newName)
		emit('renameDeck', activeActionForDeck.value, uniqueName)
	}
	onCancelRenameDeck()
}
function onCreateDeck(deckName: string) {
	const uniqueName = _getUniqueDeckName(deckName)
	emit('createDeck', uniqueName)
}
function onCloneDeck(deck: TDeckData) {
	const uniqueName = _getUniqueDeckName(`${deck.name} (Copy)`)
	emit('cloneDeck', {...deck, name: uniqueName})
}

function onConfirmDeleteDeck() {
	if (activeActionForDeck.value) emit('deleteDeck', activeActionForDeck.value)
	onCancelDeleteDeck()
}

const confirmDeleteFolderOpen = ref(false)
const confirmRenameFolderOpen = ref(false)

const menuItems = computed(() => {
	if (isDefaultFolder.value) {
		return [] // No actions for default folder
	}
	return [
		{
			label: 'Rename Folder',
			icon: 'material-symbols:edit-outline-rounded',
			action: () => (confirmRenameFolderOpen.value = true),
		},
		{
			label: 'Delete Folder',
			icon: 'material-symbols:delete-rounded',
			action: () => (confirmDeleteFolderOpen.value = true),
		},
	]
})

function onConfirmDeleteFolder() {
	emit('deleteFolder', props.folder)
	confirmDeleteFolderOpen.value = false
}
function onCancelDeleteFolder() {
	confirmDeleteFolderOpen.value = false
}
function onConfirmRenameFolder(newName: string) {
	emit('renameFolder', props.folder, newName)
	confirmRenameFolderOpen.value = false
}
function onCancelRenameFolder() {
	confirmRenameFolderOpen.value = false
}

function _getUniqueDeckName(baseName: string): string {
	let uniqueName = baseName
	let counter = 1
	const existingNames = props.folder.decks.map((deck) => deck.name)
	while (existingNames.includes(uniqueName)) {
		uniqueName = `${baseName} (${counter})`
		counter++
	}
	return uniqueName
}

const existingDeckNames = computed(() => props.folder.decks.map((d) => d.name))

// #endregion Deck Actions
// -----------------------------------------------------------------
</script>

<template>
	<div class="px-4 py-3">
		<!-- Folder Header -->
		<div
			class="w-full bg-linear-to-r from-primary-800 to-primary-700 rounded-lg px-4 py-1 flex items-center justify-between border border-primary-600 shadow-sm cursor-pointer hover:from-primary-750 hover:to-primary-650 transition-colors"
			@click="toggleCollapse"
		>
			<div class="flex items-center gap-3">
				<Icon
					:icon="
						isCollapsed
							? 'material-symbols:folder-rounded'
							: 'material-symbols:folder-open-rounded'
					"
					class="text-xl text-contrast-600 transition-transform"
				/>
				<div class="flex flex-col">
					<span class="font-semibold text-contrast-700">{{ props.folder.name }}</span>
					<span class="text-xs text-contrast-500">
						{{ props.folder.decks.length }}
						{{ props.folder.decks.length === 1 ? 'deck' : 'decks' }}
					</span>
				</div>
			</div>
			<div class="flex items-center gap-2" @click.stop v-if="!isDefaultFolder">
				<DropdownMenu :items="menuItems">
					<template #trigger>
						<Button
							rounded
							size="small"
							icon="material-symbols:more-vert"
							v-tooltip.left="'Actions'"
						/>
					</template>
				</DropdownMenu>
			</div>
		</div>
		<!-- Decks Grid -->
		<div v-if="!isCollapsed" class="p-3 flex flex-wrap w-full gap-4">
			<!-- Empty State when searching -->
			<div
				v-if="hasNoResults"
				class="w-full flex flex-col items-center justify-center py-8 text-contrast-500"
			>
				<Icon icon="material-symbols:search-off-rounded" class="text-4xl mb-2" />
				<p class="text-sm">No matching decks</p>
			</div>

			<!-- Deck Previews -->
			<div v-for="deck in filteredAndSortedDecks" :key="deck.name">
				<DeckPreview
					:deck-data="deck"
					:all-folders="props.allFolders"
					:current-folder="props.folder.name"
					@click="() => emit('clickDeck', deck)"
					@delete="() => onDeleteDeck(deck)"
					@rename="() => onRenameDeck(deck)"
					@clone="() => onCloneDeck(deck)"
					@move="(targetFolder) => emit('moveDeck', deck, targetFolder)"
				/>
			</div>

			<!-- Add Deck & Import Buttons (hidden when searching) -->
			<div
				class="w-56 h-77 grid grid-rows-2 gap-2 place-items-center"
				v-if="!isSearching && props.folder.decks.length < 200"
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
					:existing-decks-names="existingDeckNames"
					@import-deck="(deck) => emit('importDeck', deck)"
				/>
			</div>
		</div>

		<ConfirmCancelModal
			:open="confirmDeleteOpen"
			headingText="Delete Deck"
			confirmText="Delete Deck"
			cancelText="Cancel"
			@cancel="onCancelDeleteDeck"
			@confirm="onConfirmDeleteDeck"
		>
			<template #content>
				<p>Are you sure you want to delete this deck? This action cannot be undone.</p>
			</template>
		</ConfirmCancelModal>
		<NameInputModal
			:open="confirmRenameOpen"
			:existing-name="activeActionForDeck?.name"
			item-type="Deck"
			@confirm="(newName) => onConfirmRenameDeck(newName)"
			@close="onCancelRenameDeck"
		/>

		<ConfirmCancelModal
			:open="confirmDeleteFolderOpen"
			headingText="Delete Folder"
			confirmText="Delete Folder"
			cancelText="Cancel"
			@cancel="onCancelDeleteFolder"
			@confirm="onConfirmDeleteFolder"
		>
			<template #content>
				<p>
					Are you sure you want to delete this folder and all contained decks? This action
					cannot be undone.
				</p>
			</template>
		</ConfirmCancelModal>
		<NameInputModal
			:open="confirmRenameFolderOpen"
			:existing-name="props.folder.name"
			item-type="Folder"
			@confirm="(newName) => onConfirmRenameFolder(newName)"
			@close="onCancelRenameFolder"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
