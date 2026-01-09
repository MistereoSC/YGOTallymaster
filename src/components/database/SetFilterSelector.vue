<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {TFullCollection, TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {Icon} from '@iconify/vue'
import Button from '@/components/common/Button.vue'

const props = defineProps<{
	modelValue: {collectionName: string; setName: string} | null
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: {collectionName: string; setName: string} | null): void
	(e: 'change'): void
}>()

const {collections, initialized} = useCardCollections()

const isExpanded = ref(false)

const selectedCollection = ref<TFullCollection | null>(null)
const selectedSet = ref<TFullSet | null>(null)

// Sync internal state with modelValue
function syncFromModelValue() {
	if (props.modelValue) {
		const collection = collections.value.find(
			(c) => c.name === props.modelValue?.collectionName
		)
		if (collection) {
			selectedCollection.value = collection
			const set = collection.sets.find((s) => s.name === props.modelValue?.setName)
			if (set) {
				selectedSet.value = set
			} else {
				selectedSet.value = null
			}
		} else {
			selectedCollection.value = null
			selectedSet.value = null
		}
	} else {
		selectedCollection.value = null
		selectedSet.value = null
	}
}

// Initial sync
syncFromModelValue()

// Watch for external changes to modelValue
watch(() => props.modelValue, syncFromModelValue, {deep: true})

const displayText = computed(() => {
	if (selectedSet.value && selectedCollection.value) {
		return `${selectedCollection.value.name} / ${selectedSet.value.name}`
	}
	return 'No set selected'
})

const hasSelection = computed(() => selectedSet.value !== null)

function toggleExpand() {
	isExpanded.value = !isExpanded.value
}

function selectCollection(collection: TFullCollection) {
	if (selectedCollection.value?.name === collection.name) {
		selectedCollection.value = null
	} else {
		selectedCollection.value = collection
	}
}

function selectSet(set: TFullSet) {
	if (!selectedCollection.value) return

	if (selectedSet.value?.name === set.name) {
		// Deselect if clicking the same set
		selectedSet.value = null
		emit('update:modelValue', null)
	} else {
		selectedSet.value = set
		emit('update:modelValue', {
			collectionName: selectedCollection.value.name,
			setName: set.name,
		})
	}
	emit('change')
}

function clearSelection() {
	selectedCollection.value = null
	selectedSet.value = null
	emit('update:modelValue', null)
	emit('change')
}
</script>

<template>
	<div class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600">
		<!-- Header -->
		<div
			class="px-3 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between cursor-pointer"
			@click="toggleExpand"
		>
			<div class="flex items-center gap-2">
				<Icon icon="material-symbols:folder-open-rounded" class="text-contrast-500" />
				<span class="font-semibold text-contrast-600">Filter by Set</span>
			</div>
			<div class="flex items-center gap-2">
				<Icon
					:icon="
						isExpanded
							? 'material-symbols:expand-less-rounded'
							: 'material-symbols:expand-more-rounded'
					"
					class="text-contrast-500 text-xl"
				/>
			</div>
		</div>

		<!-- Selected Set Display -->
		<div v-if="!isExpanded" class="px-3 py-2 flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 text-sm">
				<Icon
					v-if="hasSelection"
					icon="material-symbols:check-circle-rounded"
					class="text-accent-500"
				/>
				<Icon v-else icon="material-symbols:circle-outline" class="text-contrast-400" />
				<span :class="hasSelection ? 'text-contrast-700' : 'text-contrast-400'">
					{{ displayText }}
				</span>
			</div>
			<div v-if="hasSelection" @click.stop>
				<Button
					icon="material-symbols:close-rounded"
					rounded
					size="small"
					@click="clearSelection"
				/>
			</div>
		</div>

		<!-- Expanded Content -->
		<div v-if="isExpanded" class="p-3 pt-2">
			<!-- Current Selection Info (matching non-expanded style) -->
			<div class="flex items-center justify-between gap-2 mb-3">
				<div class="flex items-center gap-2 text-sm">
					<Icon
						v-if="hasSelection"
						icon="material-symbols:check-circle-rounded"
						class="text-accent-500"
					/>
					<Icon v-else icon="material-symbols:circle-outline" class="text-contrast-400" />
					<span :class="hasSelection ? 'text-contrast-700' : 'text-contrast-400'">
						{{ displayText }}
					</span>
				</div>
				<Button
					v-if="hasSelection"
					icon="material-symbols:close-rounded"
					rounded
					size="small"
					@click="clearSelection"
				/>
			</div>

			<!-- Loading State -->
			<div v-if="initialized !== 'ready'" class="text-center text-contrast-400 text-sm py-4">
				Loading collections...
			</div>

			<!-- Empty State -->
			<div
				v-else-if="collections.length === 0"
				class="text-center text-contrast-400 text-sm py-4"
			>
				No collections found. Create a collection first.
			</div>

			<!-- Collections List -->
			<div v-else class="flex flex-col gap-2">
				<!-- Collection Items -->
				<div
					v-for="collection in collections"
					:key="collection.name"
					class="border border-primary-600 rounded-md overflow-hidden"
				>
					<!-- Collection Header -->
					<div
						class="px-3 py-2 bg-primary-700 flex items-center justify-between cursor-pointer hover:bg-primary-600 transition-colors"
						@click="selectCollection(collection)"
					>
						<div class="flex items-center gap-2">
							<Icon
								:icon="
									selectedCollection?.name === collection.name
										? 'material-symbols:folder-open-rounded'
										: 'material-symbols:folder-rounded'
								"
								class="text-contrast-500"
							/>
							<span class="text-sm font-medium text-contrast-600">
								{{ collection.name }}
							</span>
							<span class="text-xs text-contrast-400">
								({{ collection.sets.length }} sets)
							</span>
						</div>
						<Icon
							:icon="
								selectedCollection?.name === collection.name
									? 'material-symbols:expand-less-rounded'
									: 'material-symbols:expand-more-rounded'
							"
							class="text-contrast-500"
						/>
					</div>

					<!-- Sets List -->
					<div v-if="selectedCollection?.name === collection.name" class="bg-primary-750">
						<div
							v-if="collection.sets.length === 0"
							class="px-3 py-2 text-sm text-contrast-400 text-center"
						>
							No sets in this collection
						</div>
						<div
							v-for="set in collection.sets"
							:key="set.name"
							class="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-primary-600 transition-colors border-t border-primary-600"
							:class="{
								'bg-accent-500/20': selectedSet?.name === set.name,
							}"
							@click="selectSet(set)"
						>
							<Icon
								v-if="selectedSet?.name === set.name"
								icon="material-symbols:check-circle-rounded"
								class="text-accent-500"
							/>
							<Icon
								v-else
								icon="material-symbols:circle-outline"
								class="text-contrast-400"
							/>
							<span class="text-sm text-contrast-600">{{ set.name }}</span>
							<span class="text-xs text-contrast-400">
								({{ set.cards.length }} cards)
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
