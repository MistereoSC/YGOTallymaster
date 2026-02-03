<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuRoot,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from 'reka-ui'
import {useCardCollections} from '@/composables/useCardCollections'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {computed} from 'vue'
import {useToast} from '@/composables/useToast'

interface IProps {
	card: TCardData
	disabled?: boolean
	showReloadImageButton?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	disabled: false,
	showReloadImageButton: false,
})

const emit = defineEmits<{
	(e: 'reloadImage', cardId: number): void
}>()

const {collections, addCardToSet, getCardCountInSet} = useCardCollections()
const {addToast} = useToast()

const collectionsWithSets = computed(() => {
	return collections.value.filter((c) => c.sets.length > 0)
})

async function handleAddToSet(collectionName: string, setName: string) {
	const added = await addCardToSet(collectionName, setName, props.card, 1)
	if (added > 0) {
		addToast(`Added "${props.card.name}" to ${setName}`, 'success')
	} else {
		addToast(`"${props.card.name}" already has 3 copies in ${setName}`, 'warning')
	}
}

function handleReloadImage() {
	emit('reloadImage', props.card.id)
}

function getCardCount(collectionName: string, setName: string): number {
	return getCardCountInSet(collectionName, setName, props.card.id)
}
</script>

<template>
	<!-- When disabled, just render the slot without context menu -->
	<template v-if="props.disabled">
		<slot />
	</template>

	<!-- When enabled, wrap with context menu -->
	<ContextMenuRoot v-else>
		<ContextMenuTrigger as-child>
			<slot />
		</ContextMenuTrigger>
		<ContextMenuPortal>
			<ContextMenuContent
				class="scrollable min-w-48 max-w-64 z-50 bg-primary-800 outline-none rounded-md p-1 shadow-md shadow-black/50 text-contrast-800"
			>
				<!-- Header -->
				<ContextMenuLabel class="text-xs text-contrast-500 px-2 py-1 flex">
					<Icon icon="material-symbols:add" class="mr-2 text-lg" />
					Add to Collection
				</ContextMenuLabel>
				<ContextMenuLabel class="text-xs text-contrast-600 px-2 py-1 truncate">
					{{ props.card.name }}
				</ContextMenuLabel>
				<ContextMenuSeparator class="h-px bg-primary-600 mx-1 my-1" />

				<!-- Collections with their sets -->
				<template v-if="collectionsWithSets.length > 0">
					<template v-for="collection in collectionsWithSets" :key="collection.name">
						<ContextMenuSub>
							<ContextMenuSubTrigger
								class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center justify-between h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
							>
								<span class="flex items-center gap-2">
									<Icon
										icon="material-symbols:folder-rounded"
										class="text-lg text-accent-400"
									/>
									{{ collection.name }}
								</span>
								<Icon
									icon="material-symbols:chevron-right-rounded"
									class="text-lg"
								/>
							</ContextMenuSubTrigger>
							<ContextMenuPortal>
								<ContextMenuSubContent
									class="scrollable min-w-48 max-h-80 overflow-y-auto z-50 bg-primary-800 outline-none rounded-md p-1 shadow-md shadow-black/50 text-contrast-800"
									:side-offset="4"
								>
									<!-- Sets in collection -->
									<ContextMenuItem
										v-for="set in collection.sets"
										:key="set.name"
										class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center justify-between h-7 relative px-2 select-none outline-none data-disabled:text-contrast-500 data-disabled:pointer-events-none data-highlighted:bg-accent-500"
										:disabled="getCardCount(collection.name, set.name) >= 3"
										@select.prevent="handleAddToSet(collection.name, set.name)"
									>
										<span class="flex items-center gap-2">
											<Icon
												icon="material-symbols:list-alt-rounded"
												class="text-lg text-secondary-400"
											/>
											{{ set.name }}
										</span>
										<span
											v-if="getCardCount(collection.name, set.name) > 0"
											class="text-xs text-contrast-500 ml-2"
										>
											({{ getCardCount(collection.name, set.name) }}/3)
										</span>
									</ContextMenuItem>
								</ContextMenuSubContent>
							</ContextMenuPortal>
						</ContextMenuSub>
					</template>
				</template>

				<!-- No collections message -->
				<div
					v-else
					class="text-sm leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none text-contrast-500"
				>
					<Icon icon="material-symbols:info-outline-rounded" class="mr-2 text-lg" />
					No collections with sets
				</div>

				<!-- Reload Image Button -->
				<template v-if="props.showReloadImageButton">
					<ContextMenuSeparator class="h-px bg-primary-600 mx-1 my-1" />
					<ContextMenuItem
						class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
						@select="handleReloadImage"
					>
						<Icon
							icon="material-symbols:refresh-rounded"
							class="mr-2 text-lg text-secondary-400"
						/>
						Re-Fetch Image
					</ContextMenuItem>
				</template>
			</ContextMenuContent>
		</ContextMenuPortal>
	</ContextMenuRoot>
</template>
