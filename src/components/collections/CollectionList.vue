<script lang="ts" setup>
import {TFullCollection, TFullSet} from '@/composables/useCardCollections'
import {onMounted} from 'vue'
import SetCreationModal from './SetCreationModal.vue'
import SetPreview from './SetPreview.vue'

const props = defineProps<{
	collection: TFullCollection
}>()
const emit = defineEmits<{
	(e: 'createSet', name: string): void
	(e: 'clickSet', set: TFullSet): void
}>()
onMounted(() => {
	return
})
</script>

<template>
	<div class="pr-4">
		<div class="w-full bg-primary-600 rounded-r-md px-2 py-1 font-bold">
			{{ props.collection.name }}
		</div>
		<div class="p-2 flex flex-wrap w-full gap-4">
			<SetPreview
				v-for="set in props.collection.sets"
				:key="set.name"
				:set="set"
				@click="$emit('clickSet', set)"
			/>

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
	</div>
</template>

<style lang="scss" scoped></style>
