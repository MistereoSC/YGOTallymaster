<script lang="ts" setup>
import {Icon} from '@iconify/vue'

interface IProps {
	modelValue: boolean
	label?: string
	icon?: string
	disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	disabled: false,
	rounded: false,
})

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void
	(e: 'toggle', value: boolean): void
}>()
function onClick() {
	if (props.disabled) return
	const newValue = !props.modelValue
	emit('update:modelValue', newValue)
	emit('toggle', newValue)
}
</script>

<template>
	<button
		class="flex items-center gap-1 px-2 py-1 rounded-sm bg-accent-500 hover:bg-accent-400 cursor-pointer"
		:class="{
			'outline-secondary-500 outline-2 outline-offset-1':
				props.modelValue,
			'opacity-50 cursor-not-allowed!': props.disabled,
		}"
		:disabled="props.disabled"
		:selected="props.modelValue"
		@click="onClick"
	>
		<span v-if="!$slots.default" class="flex items-center">
			<span v-if="icon" class="text-xl">
				<Icon :icon="icon" />
			</span>
			<span v-if="label" class="font-medium">
				{{ label }}
			</span>
		</span>
		<slot></slot>
	</button>
</template>

<style lang="scss" scoped></style>
