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
import {TFullSet, TFullCollection} from '@/composables/useCardCollections'
import {computed} from 'vue'

interface IProps {
	set: TFullSet
	allCollections?: TFullCollection[]
	currentCollection?: string
}
const props = defineProps<IProps>()

const emit = defineEmits<{
	(e: 'renameSet'): void
	(e: 'deleteSet'): void
	(e: 'cloneSet'): void
	(e: 'moveSet', targetCollection: string): void
}>()

const targetCollections = computed(() => {
	if (!props.allCollections || props.allCollections.length <= 1) {
		return []
	}
	return props.allCollections.filter((col) => col.name !== props.currentCollection)
})

const hasMoveOptions = computed(() => targetCollections.value.length > 0)
</script>

<template>
	<ContextMenuRoot>
		<ContextMenuTrigger as-child>
			<slot />
		</ContextMenuTrigger>
		<ContextMenuPortal>
			<ContextMenuContent
				class="scrollable min-w-48 max-w-64 z-50 bg-primary-800 outline-none rounded-md p-1 shadow-md shadow-black/50 text-contrast-800"
			>
				<!-- Header -->
				<ContextMenuLabel class="text-xs text-contrast-600 px-2 py-1 truncate">
					{{ props.set.name }}
				</ContextMenuLabel>
				<ContextMenuSeparator class="h-px bg-primary-600 mx-1 my-1" />
				<!-- Rename -->
				<ContextMenuItem
					class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
					@select.prevent="() => emit('renameSet')"
				>
					<Icon icon="material-symbols:edit-outline-rounded" class="mr-2 text-lg" />
					Rename Set
				</ContextMenuItem>

				<!-- Clone -->
				<ContextMenuItem
					class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
					@select.prevent="() => emit('cloneSet')"
				>
					<Icon icon="material-symbols:content-copy-rounded" class="mr-2 text-lg" />
					Clone Set
				</ContextMenuItem>

				<!-- Move to (with submenu) -->
				<template v-if="hasMoveOptions">
					<ContextMenuSeparator class="h-px bg-primary-600 mx-1 my-1" />
					<ContextMenuSub>
						<ContextMenuSubTrigger
							class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center justify-between h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
						>
							<span class="flex items-center gap-2">
								<Icon
									icon="material-symbols:drive-file-move-outline-rounded"
									class="text-lg"
								/>
								Move to
							</span>
							<Icon icon="material-symbols:chevron-right-rounded" class="text-lg" />
						</ContextMenuSubTrigger>
						<ContextMenuPortal>
							<ContextMenuSubContent
								class="scrollable min-w-48 max-h-80 overflow-y-auto z-50 bg-primary-800 outline-none rounded-md p-1 shadow-md shadow-black/50 text-contrast-800"
								:side-offset="4"
							>
								<!-- Target collections -->
								<ContextMenuItem
									v-for="collection in targetCollections"
									:key="collection.name"
									class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
									@select.prevent="() => emit('moveSet', collection.name)"
								>
									<Icon
										icon="material-symbols:folder-outline-rounded"
										class="mr-2 text-lg text-accent-400"
									/>
									{{ collection.name }}
								</ContextMenuItem>
							</ContextMenuSubContent>
						</ContextMenuPortal>
					</ContextMenuSub>
				</template>

				<!-- Delete -->
				<ContextMenuSeparator class="h-px bg-primary-600 mx-1 my-1" />
				<ContextMenuItem
					class="group text-sm cursor-pointer leading-none rounded-[3px] flex items-center h-7 relative px-2 select-none outline-none data-highlighted:bg-accent-500"
					@select.prevent="() => emit('deleteSet')"
				>
					<Icon icon="material-symbols:delete-rounded" class="mr-2 text-lg" />
					Delete Set
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenuPortal>
	</ContextMenuRoot>
</template>
