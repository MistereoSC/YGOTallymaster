<script lang="ts" setup>
import {onMounted} from 'vue'

const props = defineProps<{
	modelValue: boolean
	label?: string
}>()
const emit = defineEmits<{
	(e: 'change', value: boolean): void
	(e: 'update:modelValue', value: boolean): void
}>()

function onToggle() {
	emit('update:modelValue', !props.modelValue)
	emit('change', !props.modelValue)
}
</script>

<template>
	<div class="flex items-center gap-2">
		<input
			type="checkbox"
			:checked="modelValue"
			@change="onToggle"
			class="w-4 h-4 rounded border-tertiary-500 bg-primary-600 text-accent-500 focus:ring-accent-400 focus:ring-2"
		/>
		<label
			v-if="label"
			class="font-semibold select-none text-md text-contrast-800"
		>
			{{ label }}
		</label>
	</div>
</template>

<style lang="scss" scoped></style>
