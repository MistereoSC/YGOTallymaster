<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {
	PopoverArrow,
	PopoverClose,
	PopoverContent,
	PopoverPortal,
	PopoverRoot,
	PopoverTrigger,
} from 'reka-ui'
import Button from '../common/Button.vue'
</script>

<template>
	<PopoverRoot>
		<PopoverTrigger
			class="cursor-pointer rounded-full p-1 text-tertiary-300 hover:text-tertiary-500 transition-colors border-none outline-none"
			aria-label="Update dimensions"
		>
			<Icon icon="tabler:heart-filled" class="text-3xl" />
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				side="bottom"
				:side-offset="5"
				class="text-contrast-800 rounded-lg p-2 min-w-64 bg-primary-700 shadow-md shadow-black/75"
			>
				<div class="flex flex-col gap-2">
					<h4>Owns & Wants</h4>
					<div class="grid gap-2 grid-cols-[40px_24px_auto_auto_1fr]">
						<span class="pr-2"> Own </span>
						<span class="text-accent-300 font-bold">4</span>
						<Button
							size="small"
							rounded
							icon="material-symbols:add-2-rounded"
						/>
						<Button
							size="small"
							rounded
							icon="material-symbols:remove-rounded"
						/>
					</div>
					<div class="grid gap-2 grid-cols-[40px_24px_auto_auto_1fr]">
						<span class="pr-2"> Want </span>
						<span class="text-accent-300 font-bold">4</span>
						<Button
							size="small"
							rounded
							icon="material-symbols:add-2-rounded"
						/>
						<Button
							size="small"
							rounded
							icon="material-symbols:remove-rounded"
						/>
					</div>
				</div>
				<PopoverClose
					class="rounded-full h-6 w-6 cursor-pointer inline-flex items-center justify-center absolute top-2 right-2 hover:bg-primary-500 border-none outline-none"
					aria-label="Close"
				>
					<Icon icon="radix-icons:cross-2" />
				</PopoverClose>
				<PopoverArrow class="fill-primary-700 stroke-primary-700" />
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>
</template>
