<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuPortal,
	ContextMenuRoot,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from 'reka-ui'

type TItem = {
	label: string
	action: () => void
	icon?: string
	disabled?: boolean
}
type TSeparator = {
	separator: true
}
type TMenuItem = TItem | TSeparator
interface IProps {
	items: TMenuItem[]
}
const props = defineProps<IProps>()

function isSeparator(item: TMenuItem): item is TSeparator {
	return 'separator' in item && item.separator === true
}
</script>

<template>
	<ContextMenuRoot>
		<ContextMenuTrigger as-child>
			<slot name="trigger" />
		</ContextMenuTrigger>
		<ContextMenuPortal>
			<ContextMenuContent
				class="min-w-36 z-30 bg-primary-800 outline-none rounded-md p-1 shadow-md shadow-black/50 text-contrast-800"
			>
				<template v-for="(item, index) in props.items" :key="index">
					<ContextMenuSeparator
						v-if="isSeparator(item)"
						class="h-px bg-green6 m-1"
					/>
					<ContextMenuItem
						v-else
						class="group text-sm cursor-pointer leading-none color-green-600 rounded-[3px] flex items-center h-6 relative p-1 select-none outline-none data-disabled:text-contrast-500 data-disabled:pointer-events-none data-highlighted:bg-accent-500"
						@click="() => item.action()"
						:disabled="item.disabled"
					>
						<Icon v-if="item.icon" :icon="item.icon" class="mr-2" />
						{{ item.label }}
					</ContextMenuItem>
				</template>
			</ContextMenuContent>
		</ContextMenuPortal>
	</ContextMenuRoot>
</template>
