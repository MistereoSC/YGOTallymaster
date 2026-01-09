<script lang="ts" setup>
import {TFullSet} from '@/composables/useCardCollections'
import CardPreview from '@/components/database/CardPreview.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	set: TFullSet
}>()
const emit = defineEmits<{
	(e: 'clickSet', set: TFullSet): void
	(e: 'renameSet', set: TFullSet): void
	(e: 'deleteSet', set: TFullSet): void
}>()

const menuItems = [
	{
		label: 'Rename Set',
		icon: 'material-symbols:edit-outline-rounded',
		action: () => emit('renameSet', props.set),
	},
	{
		label: 'Delete Set',
		icon: 'material-symbols:delete-rounded',
		action: () => emit('deleteSet', props.set),
	},
]
</script>

<template>
	<ContextMenu :items="menuItems">
		<template #trigger>
			<div
				class="w-43.25 h-64.5 grid place-items-center rounded-lg bg-primary-700 cursor-pointer"
				@click="() => emit('clickSet', props.set)"
			>
				<div v-if="set.cards.length > 0" class="relative">
					<CardPreview
						:card="set.cards[0]"
						size="medium"
						:gray-unowned="false"
						:gray-override="false"
					/>

					<div
						class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-primary-900/90 via-primary-900/60 to-transparent pointer-events-none"
					></div>
					<div
						class="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none"
					>
						<p class="font-bold text-sm drop-shadow-lg">
							{{ set.name }}
						</p>
						<div class="flex items-center gap-3 mt-1 text-xs text-contrast-400">
							<span class="flex font-semibold items-center gap-1">
								<Icon
									icon="material-symbols:credit-card"
									class="text-sm text-accent-400"
								/>
								{{ set.cards.length }}
								{{ set.cards.length === 1 ? 'Card' : 'Cards' }}
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
						>{{ set.name }}</span
					>
					<span class="text-contrast-500">(No Cards)</span>
				</div>
			</div>
		</template>
	</ContextMenu>
</template>

<style lang="scss" scoped></style>
