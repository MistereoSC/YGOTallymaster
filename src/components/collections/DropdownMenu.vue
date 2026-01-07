<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {
	DropdownMenuArrow,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemIndicator,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuRoot,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
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
	<DropdownMenuRoot>
		<DropdownMenuTrigger aria-label="Update dimensions">
			<slot name="trigger" />
		</DropdownMenuTrigger>
		<DropdownMenuPortal>
			<DropdownMenuContent
				side="bottom"
				:side-offset="5"
				class="text-contrast-800 rounded-lg p-2 min-w-36 bg-primary-700 shadow-md shadow-black/75"
			>
				<template v-for="(item, index) in props.items" :key="index">
					<DropdownMenuSeparator v-if="isSeparator(item)" class="h-px bg-green6 m-1" />
					<DropdownMenuItem
						v-else
						class="group text-sm cursor-pointer leading-none rounded-sm flex items-center h-6 relative p-1 select-none outline-none data-disabled:text-contrast-500 data-disabled:pointer-events-none data-highlighted:bg-accent-500 pr-4"
						@click="() => item.action()"
						:disabled="item.disabled"
					>
						<Icon v-if="item.icon" :icon="item.icon" class="mr-2" />
						{{ item.label }}
					</DropdownMenuItem>
				</template>

				<!-- <PopoverClose
					class="rounded-full h-6 w-6 cursor-pointer inline-flex items-center justify-center absolute top-2 right-2 hover:bg-primary-500 border-none outline-none"
					aria-label="Close"
				>
					<Icon icon="radix-icons:cross-2" />
				</PopoverClose> -->
				<DropdownMenuArrow class="fill-primary-700 stroke-primary-700" />
			</DropdownMenuContent>
		</DropdownMenuPortal>
	</DropdownMenuRoot>
</template>
