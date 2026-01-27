<script lang="ts" setup>
import {TFullSet, TFullCollection} from '@/composables/useCardCollections'
import CardPreview from '@/components/database/CardPreview.vue'
import SetContextMenu from './SetContextMenu.vue'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	set: TFullSet
	allCollections?: TFullCollection[]
	currentCollection?: string
}>()
const emit = defineEmits<{
	(e: 'clickSet'): void
	(e: 'renameSet'): void
	(e: 'deleteSet'): void
	(e: 'cloneSet'): void
	(e: 'moveSet', targetCollection: string): void
}>()
</script>

<template>
	<SetContextMenu
		:set="props.set"
		:all-collections="props.allCollections"
		:current-collection="props.currentCollection"
		@rename-set="() => emit('renameSet')"
		@delete-set="() => emit('deleteSet')"
		@clone-set="() => emit('cloneSet')"
		@move-set="(targetCollection) => emit('moveSet', targetCollection)"
	>
		<div
			class="w-43.25 h-64.5 grid place-items-center rounded-lg bg-primary-700 cursor-pointer"
			@click="() => emit('clickSet')"
		>
			<div v-if="props.set.cards.length > 0" class="relative">
				<CardPreview
					:card="props.set.cards[0]"
					size="medium"
					:gray-unowned="false"
					:gray-override="false"
					show-banlist-for="none"
				/>

				<div
					class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-primary-900/90 via-primary-900/60 to-transparent pointer-events-none"
				></div>
				<div class="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
					<p class="font-bold text-sm drop-shadow-lg">
						{{ props.set.name }}
					</p>
					<div class="flex items-center gap-3 mt-1 text-xs text-contrast-400">
						<span class="flex font-semibold items-center gap-1">
							<Icon
								icon="material-symbols:credit-card"
								class="text-sm text-accent-400"
							/>
							{{ props.set.cards.length }}
							{{ props.set.cards.length === 1 ? 'Card' : 'Cards' }}
						</span>
					</div>
				</div>
			</div>
			<div
				v-else
				class="flex flex-col items-center h-full w-full justify-center rounded-lg bg-linear-to-br from-primary-600/40 via-primary-700 to-primary-800/70 transition-colors duration-200 hover:from-primary-600/80 hover:via-primary-600 hover:to-primary-700/80 group"
			>
				<Icon
					icon="material-symbols:credit-card-off-rounded"
					class="text-4xl text-contrast-300 mb-2 transition-transform duration-200 group-hover:text-accent-400"
				/>
				<span
					class="font-bold transition-colors duration-200 group-hover:text-contrast-700 text-center px-2"
					>{{ props.set.name }}</span
				>
				<span class="text-contrast-500">(No Cards)</span>
			</div>
		</div>
	</SetContextMenu>
</template>

<style lang="scss" scoped></style>
