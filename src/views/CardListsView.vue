<script lang="ts" setup>
import CollectionCreationModal from '@/components/collections/CollectionCreationModal.vue'
import CollectionList from '@/components/collections/CollectionList.vue'
import SetView from '@/components/collections/SetView.vue'
import Button from '@/components/common/Button.vue'
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
} = useCardCollections()

const activeSet = ref<null | {collectionName: string; set: TFullSet}>(null)

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
				<div class="flex items-center gap-3">
					<div class="flex flex-col">
						<h1 class="font-semibold text-contrast-700">Collections</h1>
					</div>
				</div>
				<div v-if="collections.length < 64">
					<CollectionCreationModal
						@create="(name) => createCollection(name)"
						:existing-collections="collections"
					>
						<template #trigger>
							<Button
								icon="material-symbols:add-rounded"
								label="New Collection"
								size="small"
							/>
						</template>
					</CollectionCreationModal>
				</div>
			</div>
			<!-- Collections List -->
			<div class="flex flex-col flex-1 overflow-y-scroll scrollable">
				<div v-for="collection in collections" :key="collection.name">
					<CollectionList
						:collection="collection"
						@create-set="(setName) => createSet(collection.name, setName)"
						@click-set="(set) => (activeSet = {collectionName: collection.name, set})"
						@delete-set="(set) => deleteSet(collection.name, set)"
						@rename-set="(set, newName) => renameSet(collection.name, set, newName)"
						@delete-collection="() => deleteCollection(collection.name)"
						@rename-collection="
							(_, newName) => renameCollection(collection.name, newName)
						"
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
				<CollectionCreationModal @create="(name) => createCollection(name)">
					<template #trigger>
						<Button icon="material-symbols:add-rounded" label="Create Collection" />
					</template>
				</CollectionCreationModal>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
