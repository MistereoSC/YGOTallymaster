<script lang="ts" setup>
import CollectionCreationModal from '@/components/collections/CollectionCreationModal.vue'
import CollectionList from '@/components/collections/CollectionList.vue'
import SetView from '@/components/collections/SetView.vue'
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import {TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'

const {collections, createCollection, createSet, initialized, saveSet} = useCardCollections()

onMounted(async () => {})

async function onCreateCollection(name: string) {
	await createCollection(name)
}
async function onCreateSet(collectionName: string, setName: string) {
	await createSet(collectionName, setName)
}

const activeSet = ref<null | {collectionName: string; set: TFullSet}>(null)
</script>

<template>
	<div class="w-full h-full overflow-hidden">
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
		<div
			v-else-if="collections.length > 0"
			class="flex flex-col h-full overflow-y-scroll scrollable"
		>
			<div v-for="collection in collections">
				<CollectionList
					:key="collection.name"
					:collection="collection"
					@create-set="(setName) => onCreateSet(collection.name, setName)"
					@click-set="(set) => (activeSet = {collectionName: collection.name, set})"
				/>
			</div>

			<div class="w-full flex justify-center" v-if="collections.length < 64">
				<div class="mb-4">
					<CollectionCreationModal
						@create="(name) => onCreateCollection(name)"
						:existing-collections="collections"
					>
						<template #trigger>
							<Button
								class="text-contrast-800 mt-4"
								icon="material-symbols:add-2-rounded"
								label="Create Collection"
							/>
						</template>
					</CollectionCreationModal>
				</div>
			</div>
		</div>
		<div
			v-else
			class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
		>
			<Icon icon="material-symbols:bookmark-outline-rounded" class="text-4xl" />
			<p class="text-lg font-medium">No collections found</p>
			<p class="text-sm opacity-75">Let's start by creating your first collection</p>
			<div>
				<CollectionCreationModal @create="(name) => onCreateCollection(name)">
					<template #trigger>
						<Button
							class="text-contrast-800 mt-4"
							icon="material-symbols:add-2-rounded"
							label="Create Collection"
						/>
					</template>
				</CollectionCreationModal>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
