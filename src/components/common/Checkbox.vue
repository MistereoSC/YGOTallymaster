<script lang="ts" setup>
import {Icon} from '@iconify/vue'

interface IProps {
	modelValue: boolean | null | undefined
	label?: string
	disabled?: boolean
	size?: 'small' | 'medium' | 'large'
	allowOnlyCheckToToggle?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	allowOnlyCheckToToggle: false,
	disabled: false,
	size: 'medium',
})

const emit = defineEmits<{
	(e: 'change', value: boolean): void
	(e: 'update:modelValue', value: boolean): void
}>()

function onToggle(target: 'checkbox' | 'container') {
	if (props.disabled) return
	if (props.allowOnlyCheckToToggle && target === 'container') return
	if (!props.allowOnlyCheckToToggle && target === 'checkbox') return
	emit('update:modelValue', !props.modelValue)
	emit('change', !props.modelValue)
}
</script>

<template>
	<div
		class="flex items-center gap-2 select-none"
		:class="{
			'opacity-50 cursor-not-allowed!': props.disabled,
			'cursor-pointer': props.allowOnlyCheckToToggle === false,
			'cursor-default': props.allowOnlyCheckToToggle === true,
		}"
		@click="() => onToggle('container')"
	>
		<div
			class="flex items-center justify-center rounded-sm border-2 transition-colors cursor-pointer"
			:class="{
				'w-4 h-4': props.size === 'small',
				'w-5 h-5': props.size === 'medium',
				'w-6 h-6': props.size === 'large',
				'bg-accent-500 border-accent-500': modelValue,
				'bg-primary-700 border-primary-500 hover:border-accent-400': !modelValue,
			}"
			@click="() => onToggle('checkbox')"
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
			class="font-semibold"
			:class="{
				'text-sm': props.size === 'small',
				'text-base': props.size === 'medium',
				'text-lg': props.size === 'large',
				'cursor-pointer': props.allowOnlyCheckToToggle === false,
			}"
		>
			{{ label }}
		</label>
		<slot></slot>
	</div>
</template>

<style lang="scss" scoped></style>
