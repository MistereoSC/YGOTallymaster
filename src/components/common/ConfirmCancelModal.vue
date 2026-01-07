<script setup lang="ts">
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger,
} from 'reka-ui'
import Button from './Button.vue'
import {useSlots} from 'vue'

const slots = useSlots()
const props = defineProps<{
	open: boolean
	headingText: string
	confirmText?: string
	cancelText?: string
}>()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'confirm'): void
}>()
</script>

<template>
	<AlertDialogRoot :open="props.open">
		<AlertDialogTrigger as-child v-if="slots.trigger">
			<slot name="trigger" />
		</AlertDialogTrigger>
		<AlertDialogPortal>
			<AlertDialogOverlay
				class="bg-primary-800/90 dark:bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30"
			/>
			<AlertDialogContent
				class="z-100 text-sm data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-126 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-primary-700 p-6 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
			>
				<AlertDialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
					{{ props.headingText }}
				</AlertDialogTitle>
				<AlertDialogDescription class="text-mauve11 mt-4 mb-5 text-sm leading-normal">
					<slot name="content" />
				</AlertDialogDescription>
				<div class="flex justify-end gap-4">
					<AlertDialogCancel @click="emit('cancel')">
						<Button :label="props.cancelText || 'Cancel'" @click="emit('cancel')" />
					</AlertDialogCancel>
					<AlertDialogAction>
						<Button :label="props.confirmText || 'Confirm'" @click="emit('confirm')" />
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialogPortal>
	</AlertDialogRoot>
</template>
