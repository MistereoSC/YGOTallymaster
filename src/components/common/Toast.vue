<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {computed} from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

const props = defineProps<{
	id: string
	message: string
	type?: ToastType
	duration?: number
}>()

const emit = defineEmits<{
	(e: 'close', id: string): void
}>()

const typeConfig = computed(() => {
	switch (props.type) {
		case 'success':
			return {
				icon: 'tabler:check',
				bgClass: 'bg-secondary-500/20',
				borderClass: 'border-secondary-500/50',
				iconClass: 'text-secondary-400',
			}
		case 'error':
			return {
				icon: 'tabler:x',
				bgClass: 'bg-red-500/20',
				borderClass: 'border-red-500/50',
				iconClass: 'text-red-400',
			}
		case 'warning':
			return {
				icon: 'tabler:alert-triangle',
				bgClass: 'bg-amber-500/20',
				borderClass: 'border-amber-500/50',
				iconClass: 'text-amber-400',
			}
		case 'info':
		default:
			return {
				icon: 'tabler:info-circle',
				bgClass: 'bg-accent-500/20',
				borderClass: 'border-accent-500/50',
				iconClass: 'text-accent-400',
			}
	}
})
</script>

<template>
	<div
		class="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg min-w-70 max-w-100"
		:class="[typeConfig.bgClass, typeConfig.borderClass, 'bg-primary-800/95']"
	>
		<div
			class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
			:class="typeConfig.bgClass"
		>
			<Icon :icon="typeConfig.icon" class="text-lg" :class="typeConfig.iconClass" />
		</div>
		<p class="flex-1 text-sm text-contrast-700 font-medium">{{ props.message }}</p>
		<button
			class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer"
			@click="emit('close', props.id)"
		>
			<Icon icon="tabler:x" class="text-sm text-contrast-500 hover:text-contrast-700" />
		</button>
	</div>
</template>

<style lang="scss" scoped></style>
