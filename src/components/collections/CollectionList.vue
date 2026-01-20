<script lang="ts" setup>
import {TFullCollection, TFullSet} from '@/composables/useCardCollections'
import SetPreview from './SetPreview.vue'
import ConfirmCancelModal from '@/components/common/ConfirmCancelModal.vue'
import {ref} from 'vue'
import Button from '@/components/common/Button.vue'
import DropdownMenu from './DropdownMenu.vue'
import {Icon} from '@iconify/vue'
import NameInputModal from '@/components/common/NameInputModal.vue'

const props = defineProps<{
	collection: TFullCollection
}>()
const emit = defineEmits<{
	(e: 'createSet', name: string): void
	(e: 'cloneSet', set: TFullSet): void
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
		if (activeActionForSet.value.name === newName) {
			onCancelRenameSet()
			return
		}
		const uniqueName = _getUniqueSetName(newName)
		emit('renameSet', activeActionForSet.value, uniqueName)
	}
	onCancelRenameSet()
}
function onCreateSet(setName: string) {
	const uniqueName = _getUniqueSetName(setName)
	emit('createSet', uniqueName)
}
function onCloneSet(set: TFullSet) {
	const uniqueName = _getUniqueSetName(`${set.name} (Copy)`)
	emit('cloneSet', {...set, name: uniqueName})
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

function _getUniqueSetName(baseName: string): string {
	let uniqueName = baseName
	let counter = 1
	const existingNames = props.collection.sets.map((set) => set.name)
	while (existingNames.includes(uniqueName)) {
		uniqueName = `${baseName} (${counter})`
		counter++
	}
	return uniqueName
}

// #endregion Set Actions
// -----------------------------------------------------------------
</script>

<template>
	<div class="px-4 py-3">
		<!-- Collection Header -->
		<div
			class="w-full bg-linear-to-r from-primary-800 to-primary-700 rounded-lg px-4 py-1 flex items-center justify-between border border-primary-600 shadow-sm"
		>
			<div class="flex items-center gap-3">
				<div class="flex flex-col">
					<span class="font-semibold text-contrast-700">{{ props.collection.name }}</span>
					<span class="text-xs text-contrast-500">
						{{ props.collection.sets.length }}
						{{ props.collection.sets.length === 1 ? 'set' : 'sets' }}
					</span>
				</div>
			</div>
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
		<!-- Sets Grid -->
		<div class="p-3 flex flex-wrap w-full gap-4">
			<div v-for="set in props.collection.sets" :key="set.name">
				<SetPreview
					:set="set"
					@clickSet="() => emit('clickSet', set)"
					@delete-set="() => onDeleteSet(set)"
					@rename-set="() => onRenameSet(set)"
					@clone-set="() => onCloneSet(set)"
				/>
			</div>
			<div
				class="w-43.25 h-64.5 grid place-items-center"
				v-if="props.collection.sets.length < 64"
			>
				<NameInputModal item-type="Set" @confirm="(name) => onCreateSet(name)">
					<template #trigger>
						<div
							class="h-full w-full rounded-lg bg-primary-700/50 cursor-pointer shadow-lg transition-all duration-200 hover:bg-primary-600/70 border-2 border-dashed border-primary-500 hover:border-accent-500/50 group"
						>
							<div
								class="select-none h-full w-full flex justify-center items-center flex-col gap-2"
							>
								<div
									class="w-12 h-12 rounded-full bg-primary-600 group-hover:bg-accent-500/20 flex items-center justify-center transition-colors"
								>
									<Icon
										icon="material-symbols:add-rounded"
										class="text-3xl text-contrast-400 group-hover:text-accent-400 transition-colors"
									/>
								</div>
								<span
									class="font-semibold text-contrast-400 group-hover:text-contrast-600 transition-colors"
								>
									Add Set
								</span>
							</div>
						</div>
					</template>
				</NameInputModal>
			</div>
		</div>

		<ConfirmCancelModal
			:open="confirmDeleteOpen"
			headingText="Delete Set"
			confirmText="Delete Set"
			cancelText="Cancel"
			@cancel="onCancelDeleteSet"
			@confirm="onConfirmDeleteSet"
		>
			<template #content>
				<p>Are you sure you want to delete this set? This action cannot be undone.</p>
			</template>
		</ConfirmCancelModal>
		<NameInputModal
			:open="confirmRenameOpen"
			:existing-name="activeActionForSet?.name"
			item-type="Set"
			@confirm="(newName) => onConfirmRenameSet(newName)"
			@close="onCancelRenameSet"
		/>

		<ConfirmCancelModal
			:open="confirmDeleteCollectionOpen"
			headingText="Delete Collection"
			confirmText="Delete Collection"
			cancelText="Cancel"
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
		<NameInputModal
			:open="confirmRenameCollectionOpen"
			:existing-name="props.collection.name"
			item-type="Collection"
			@confirm="(newName) => onConfirmRenameCollection(newName)"
			@close="onCancelRenameCollection"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
