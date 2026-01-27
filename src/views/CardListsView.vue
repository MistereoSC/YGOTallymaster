<script lang="ts" setup>
import CollectionList from '@/components/collections/CollectionList.vue'
import SetView from '@/components/collections/SetView.vue'
import Button from '@/components/common/Button.vue'
import NameInputModal from '@/components/common/NameInputModal.vue'
import Spinner from '@/components/common/Spinner.vue'
import {TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {Icon} from '@iconify/vue'
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'

const {
	collections,
	createCollection,
	createSet,
	initialized,
	deleteSet,
	renameSet,
	deleteCollection,
	renameCollection,
	moveSet,
} = useCardCollections()

const activeSet = ref<null | {collectionName: string; set: TFullSet}>(null)
const searchQuery = ref('')
const sortBy = ref<
	'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'cardAmount_asc' | 'cardAmount_desc'
>('date_desc')

enum ESortBy {
	'date_desc' = 'Date (New-Old)',
	'date_asc' = 'Date (Old-New)',
	'name_asc' = 'Name (A-Z)',
	'name_desc' = 'Name (Z-A)',
	'cardAmount_desc' = 'Cards (Many-Few)',
	'cardAmount_asc' = 'Cards (Few-Many)',
}

watch(activeSet, (newValue, oldValue) => {
	if (newValue !== null && oldValue === null) {
		history.pushState({deckOpen: true}, '')
	}
})

const handlePopState = () => {
	if (activeSet.value !== null) {
		activeSet.value = null
	}
}

onMounted(() => {
	window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
	window.removeEventListener('popstate', handlePopState)
})

function onCreateCollection(collectionName: string) {
	const uniqueName = _getUniqueCollectionName(collectionName)
	createCollection(uniqueName)
}
function onRenameCollection(oldName: string, newName: string) {
	if (oldName === newName) return
	const uniqueName = _getUniqueCollectionName(newName)
	renameCollection(oldName, uniqueName)
}
function onCloneSet(collectionName: string, set: TFullSet) {
	createSet(collectionName, set.name, set)
}

function onMoveSet(collectionName: string, set: TFullSet, targetCollection: string) {
	moveSet(set.name, collectionName, targetCollection)
}

function _getUniqueCollectionName(baseName: string): string {
	let uniqueName = baseName
	let counter = 1
	const existingNames = collections.value.map((col) => col.name)
	while (existingNames.includes(uniqueName)) {
		uniqueName = `${baseName} (${counter})`
		counter++
	}
	return uniqueName
}
</script>

<template>
	<div class="w-full h-full overflow-hidden flex flex-col">
		<div v-if="initialized !== 'ready'" class="w-full h-full grid place-content-center">
			<Spinner />
		</div>
		<div v-else-if="activeSet" class="h-full">
			<SetView
				:set="activeSet.set"
				@close="activeSet = null"
				:collection-name="activeSet.collectionName"
			/>
		</div>
		<template v-else-if="collections.length > 0">
			<!-- Page Header -->
			<div
				class="h-12 w-full px-4 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
			>
				<div class="flex items-center gap-3 flex-1">
					<div class="flex flex-col">
						<h1 class="font-semibold text-contrast-700">Collections</h1>
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
							placeholder="Search sets..."
							class="w-full bg-primary-600 text-contrast-700 placeholder-contrast-500 rounded-md pl-9 pr-3 py-1.5 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors"
						/>
						<button
							v-if="searchQuery"
							@click="searchQuery = ''"
							class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
						>
							<Icon icon="material-symbols:close-rounded" class="text-lg" />
						</button>
					</div>

					<!-- Sort Dropdown -->
					<div class="relative">
						<select
							v-model="sortBy"
							class="bg-primary-600 text-contrast-700 rounded-md px-3 py-1.5 pr-8 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors appearance-none cursor-pointer"
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
				<div v-if="collections.length < 256" class="ml-3">
					<NameInputModal
						@confirm="(newName) => onCreateCollection(newName)"
						item-type="Collection"
					>
						<template #trigger>
							<Button
								icon="material-symbols:add-rounded"
								label="New Collection"
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
					Showing search results. "Add Set" buttons are hidden while searching.
					<button
						@click="searchQuery = ''"
						class="cursor-pointer ml-2 text-accent-400 hover:text-accent-300 underline transition-colors"
					>
						Clear search
					</button>
				</span>
			</div>

			<!-- Collections List -->
			<div class="flex flex-col flex-1 overflow-y-scroll scrollable">
				<div v-for="collection in collections" :key="collection.name">
					<CollectionList
						:collection="collection"
						:search-query="searchQuery"
						:sort-by="sortBy"
						:all-collections="collections"
						@create-set="(setName) => createSet(collection.name, setName)"
						@click-set="(set) => (activeSet = {collectionName: collection.name, set})"
						@delete-set="(set) => deleteSet(collection.name, set)"
						@rename-set="(set, newName) => renameSet(collection.name, set, newName)"
						@move-set="
							(set, targetCollection) =>
								onMoveSet(collection.name, set, targetCollection)
						"
						@delete-collection="() => deleteCollection(collection.name)"
						@rename-collection="
							(_, newName) => onRenameCollection(collection.name, newName)
						"
						@clone-set="(newSet) => onCloneSet(collection.name, newSet)"
					/>
				</div>
			</div>
		</template>
		<div v-else class="flex flex-col items-center justify-center h-full gap-2">
			<div
				class="w-16 h-16 rounded-2xl bg-secondary-500/20 flex items-center justify-center mb-2"
			>
				<Icon
					icon="material-symbols:bookmark-outline-rounded"
					class="text-secondary-400 text-4xl"
				/>
			</div>
			<p class="text-lg font-medium text-contrast-700">No collections found</p>
			<p class="text-sm text-contrast-500">Let's start by creating your first collection</p>
			<div class="mt-2">
				<NameInputModal
					@confirm="(newName) => onCreateCollection(newName)"
					item-type="Collection"
				>
					<template #trigger>
						<Button icon="material-symbols:add-rounded" label="Create Collection" />
					</template>
				</NameInputModal>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
