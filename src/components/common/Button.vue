<script lang="ts" setup>
import {Icon} from '@iconify/vue'

interface IProps {
	label?: string
	icon?: string
	disabled?: boolean
	size?: 'tiny' | 'small' | 'medium' | 'large'
	variant?: 'primary' | 'secondary' | 'tertiary' | 'transparent'
	rounded?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	disabled: false,
	size: 'medium',
	variant: 'primary',
	rounded: false,
})

const emit = defineEmits<{
	(e: 'click'): void
}>()
</script>

<template>
	<button
		class="transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
		:class="{
			'opacity-50 cursor-default': props.disabled,
			// Non-rounded sizes
			'rounded-sm px-2 py-1 text-xs': !props.rounded && props.size === 'tiny',
			'rounded-sm px-2 py-1 text-sm': !props.rounded && props.size === 'small',
			'rounded-sm px-2 py-1.5 text-base': !props.rounded && props.size === 'medium',
			'rounded-sm px-3 py-2 text-xl': !props.rounded && props.size === 'large',
			// Rounded sizes (fixed dimensions for perfect circle)
			'rounded-full w-5 h-5': props.rounded && props.size === 'tiny',
			'rounded-full w-7 h-7': props.rounded && props.size === 'small',
			'rounded-full w-9 h-9': props.rounded && props.size === 'medium',
			'rounded-full w-11 h-11': props.rounded && props.size === 'large',
			// Variants
			'bg-accent-500 hover:bg-accent-400': props.variant === 'primary',
			'bg-secondary-500 hover:bg-secondary-400': props.variant === 'secondary',
			'bg-tertiary-500 hover:bg-tertiary-400': props.variant === 'tertiary',
			'bg-primary-500/20 hover:bg-primary-500/80': props.variant === 'transparent',
		}"
		:disabled="props.disabled"
		@click="() => emit('click')"
	>
		<span v-if="props.icon && !$slots.default">
			<Icon
				:icon="props.icon"
				:class="{
					'text-sm': props.size === 'tiny',
					'text-md': props.size === 'small',
					'text-lg': props.size === 'medium',
					'text-xl': props.size === 'large',
				}"
			/>
		</span>
		<span v-if="label && !$slots.default" class="font-medium whitespace-nowrap">
			{{ props.label }}
		</span>
		<slot></slot>
	</button>
</template>

<style lang="scss" scoped></style>
