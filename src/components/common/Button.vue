<script lang="ts" setup>
import {Icon} from '@iconify/vue'

interface IProps {
	label?: string
	icon?: string
	disabled?: boolean
	size?: 'small' | 'medium' | 'large'
	rounded?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	disabled: false,
	size: 'medium',
	rounded: false,
})

const emit = defineEmits<{
	(e: 'click'): void
}>()
</script>

<template>
	<button
		class="flex items-center justify-center gap-1 px-2 py-1 rounded-sm bg-accent-500 hover:bg-accent-400 cursor-pointer"
		:class="{
			'opacity-50 cursor-not-allowed!': props.disabled,
			'py-1 px-2 text-sm': props.size === 'small',
			'py-1.5 px-2 text-base': props.size === 'medium',
			'py-2 px-3 text-xl': props.size === 'large',
			'rounded-4xl! p-1.5!': props.rounded && props.size === 'small',
			'rounded-4xl! p-2!': props.rounded && props.size === 'medium',
			'rounded-4xl! p-2.5!': props.rounded && props.size === 'large',
		}"
		:disabled="props.disabled"
		@click="() => emit('click')"
	>
		<span v-if="icon && !$slots.default">
			<Icon
				:icon="icon"
				:class="{
					'text-md': props.size === 'small',
					'text-lg': props.size === 'medium',
					'text-xl': props.size === 'large',
				}"
			/>
		</span>
		<span v-if="label && !$slots.default" class="font-medium">
			{{ label }}
		</span>
		<slot></slot>
	</button>
</template>

<style lang="scss" scoped></style>
