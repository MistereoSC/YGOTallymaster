<script lang="ts" setup>
import {TFullCollection, TFullSet} from '@/composables/useCardCollections'
import SetCreationModal from './SetCreationModal.vue'
import SetPreview from './SetPreview.vue'
import ConfirmCancelModal from '../common/ConfirmCancelModal.vue'
import {ref} from 'vue'
import Button from '../common/Button.vue'
import DropdownMenu from './DropdownMenu.vue'
import CollectionCreationModal from './CollectionCreationModal.vue'

const props = defineProps<{
	collection: TFullCollection
}>()
const emit = defineEmits<{
	(e: 'createSet', name: string): void
	(e: 'deleteSet', set: TFullSet): void
	(e: 'renameSet', set: TFullSet, newName: string): void
	(e: 'clickSet', set: TFullSet): void
	(e: 'deleteCollection', collection: TFullCollection): void
	(e: 'renameCollection', collection: TFullCollection, newName: string): void
}>()

// -----------------------------------------------------------------
// #region Set Actions
// -----------------------------------------------------------------

const activeActionForSet = ref<null | TFullSet>(null)

const confirmRenameOpen = ref(false)
function onRenameSet(set: TFullSet) {
	activeActionForSet.value = set
	confirmRenameOpen.value = true
}

function onCancelRenameSet() {
	activeActionForSet.value = null
	confirmRenameOpen.value = false
}

const confirmDeleteOpen = ref(false)
function onDeleteSet(set: TFullSet) {
	activeActionForSet.value = set
	confirmDeleteOpen.value = true
}
function onCancelDeleteSet() {
	activeActionForSet.value = null
	confirmDeleteOpen.value = false
}

function onConfirmRenameSet(newName: string) {
	if (activeActionForSet.value) {
		emit('renameSet', activeActionForSet.value, newName)
	}
	onCancelRenameSet()
}

function onConfirmDeleteSet() {
	if (activeActionForSet.value) emit('deleteSet', activeActionForSet.value)
	onCancelDeleteSet()
}

const confirmDeleteCollectionOpen = ref(false)
const confirmRenameCollectionOpen = ref(false)
const menuItems = [
	{
		label: 'Rename Collection',
		icon: 'material-symbols:edit-outline-rounded',
		action: () => (confirmRenameCollectionOpen.value = true),
	},
	{
		label: 'Delete Collection',
		icon: 'material-symbols:delete-rounded',
		action: () => (confirmDeleteCollectionOpen.value = true),
	},
]
function onConfirmDeleteCollection() {
	emit('deleteCollection', props.collection)
	confirmDeleteCollectionOpen.value = false
}
function onCancelDeleteCollection() {
	confirmDeleteCollectionOpen.value = false
}
function onConfirmRenameCollection(newName: string) {
	emit('renameCollection', props.collection, newName)
	confirmRenameCollectionOpen.value = false
}
function onCancelRenameCollection() {
	confirmRenameCollectionOpen.value = false
}

// #endregion Set Actions
// -----------------------------------------------------------------
</script>

<template>
	<div class="pr-4">
		<div
			class="w-full bg-primary-600 rounded-r-md px-2 py-1 font-bold flex items-center justify-between"
		>
			<span>{{ props.collection.name }}</span>
			<DropdownMenu :items="menuItems">
				<template #trigger>
					<Button rounded size="small" icon="material-symbols:menu-rounded" />
				</template>
			</DropdownMenu>
		</div>
		<div class="p-2 flex flex-wrap w-full gap-4">
			<div v-for="set in props.collection.sets" :key="set.name">
				<SetPreview
					:set="set"
					@clickSet="() => emit('clickSet', set)"
					@delete-set="(set) => onDeleteSet(set)"
					@rename-set="(set) => onRenameSet(set)"
				/>
			</div>
			<div
				class="w-43.25 h-64.5 grid place-items-center"
				v-if="props.collection.sets.length < 64"
			>
				<SetCreationModal
					:existing-sets="props.collection.sets"
					@create="(name) => emit('createSet', name)"
				>
					<template #trigger>
						<div
							class="h-full w-full rounded-lg text-contrast-400 hover:text-contrast-900 bg-primary-700 cursor-pointer shadow-lg transition-colors hover:bg-primary-600"
						>
							<div
								class="select-none h-full w-full flex justify-center items-center flex-col font-bold"
							>
								<span class="text-4xl">+</span>
								<span class="">Add Set</span>
							</div>
						</div>
					</template>
				</SetCreationModal>
			</div>
		</div>

		<ConfirmCancelModal
			:open="confirmDeleteOpen"
			headingText="Delete Set"
			yesText="Delete Set"
			noText="Cancel"
			@cancel="onCancelDeleteSet"
			@confirm="onConfirmDeleteSet"
		>
			<template #content>
				<p>Are you sure you want to delete this set? This action cannot be undone.</p>
			</template>
		</ConfirmCancelModal>
		<SetCreationModal
			:open="confirmRenameOpen"
			:existing-sets="props.collection.sets"
			:existing-set-name-for-rename="activeActionForSet?.name"
			@close="onCancelRenameSet"
			@create="onConfirmRenameSet"
		/>

		<ConfirmCancelModal
			:open="confirmDeleteCollectionOpen"
			headingText="Delete Collection"
			yesText="Delete Collection"
			noText="Cancel"
			@cancel="onCancelDeleteCollection"
			@confirm="onConfirmDeleteCollection"
		>
			<template #content>
				<p>
					Are you sure you want to delete this Collection and all contained sets? This
					action cannot be undone.
				</p>
			</template>
		</ConfirmCancelModal>
		<CollectionCreationModal
			:open="confirmRenameCollectionOpen"
			:existing-collections="[]"
			:existing-collection-name-for-rename="props.collection.name"
			@create="onConfirmRenameCollection"
			@close="onCancelRenameCollection"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
