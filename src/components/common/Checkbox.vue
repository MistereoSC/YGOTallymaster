<script lang="ts" setup>
import {Icon} from '@iconify/vue'

interface IProps {
	modelValue: boolean | null | undefined
	label?: string
	disabled?: boolean
	size?: 'small' | 'medium' | 'large'
}
const props = withDefaults(defineProps<IProps>(), {
	disabled: false,
	size: 'medium',
})

const emit = defineEmits<{
	(e: 'change', value: boolean): void
	(e: 'update:modelValue', value: boolean): void
}>()

function onToggle() {
	if (props.disabled) return
	emit('update:modelValue', !props.modelValue)
	emit('change', !props.modelValue)
}
</script>

<template>
	<div
		class="flex items-center gap-2 cursor-pointer select-none"
		:class="{
			'opacity-50 cursor-not-allowed!': props.disabled,
		}"
		@click="onToggle"
	>
		<div
			class="flex items-center justify-center rounded-sm border-2 transition-colors"
			:class="{
				'w-4 h-4': props.size === 'small',
				'w-5 h-5': props.size === 'medium',
				'w-6 h-6': props.size === 'large',
				'bg-accent-500 border-accent-500': modelValue,
				'bg-primary-700 border-primary-500 hover:border-accent-400': !modelValue,
			}"
		>
			<Icon
				v-if="modelValue"
				icon="material-symbols:check-rounded"
				class="text-white"
				:class="{
					'text-xs': props.size === 'small',
					'text-sm': props.size === 'medium',
					'text-base': props.size === 'large',
				}"
			/>
		</div>
		<label
			v-if="label"
			class="font-semibold cursor-pointer"
			:class="{
				'text-sm': props.size === 'small',
				'text-base': props.size === 'medium',
				'text-lg': props.size === 'large',
			}"
		>
			{{ label }}
		</label>
		<slot></slot>
	</div>
</template>

<style lang="scss" scoped></style>
