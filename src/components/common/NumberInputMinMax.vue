<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {onMounted, ref, watch} from 'vue'

const props = defineProps<{
	modelValue: [number | null, number | null]
	minVal?: number
	maxVal?: number
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: [number | null, number | null]): void
	(e: 'change', value: [number | null, number | null]): void
}>()
onMounted(() => {
	_initialSet()
})
function _initialSet() {
	minInput.value = props.modelValue[0]
	maxInput.value = props.modelValue[1]
}
watch(
	() => props.modelValue,
	(newValue) => {
		minInput.value = newValue[0]
		maxInput.value = newValue[1]
	}
)

const minInput = ref<number | null>(props.modelValue[0])
const maxInput = ref<number | null>(props.modelValue[1])
const minInputRef = ref<HTMLInputElement | null>(null)
const maxInputRef = ref<HTMLInputElement | null>(null)

function focusMinInput() {
	minInputRef.value?.focus()
}
function focusMaxInput() {
	maxInputRef.value?.focus()
}

function clampValue(value: number | null, min: number, max: number): number | null {
	if (value === null) return null
	return Math.max(min, Math.min(max, value))
}

function validateAndClampMin(value: number | null): number | null {
	if (value === null) return null
	const min = props.minVal ?? -1
	const max = props.maxVal ?? 5000
	return clampValue(value, min, max)
}

function validateAndClampMax(value: number | null): number | null {
	if (value === null) return null
	const min = props.minVal ?? -1
	const max = props.maxVal ?? 5000
	return clampValue(value, min, max)
}

function onMinInputBlur() {
	// Only clamp if the field has a value, otherwise keep it null
	if (
		minInput.value !== null &&
		minInput.value !== undefined &&
		String(minInput.value).trim() !== ''
	) {
		const clampedValue = validateAndClampMin(Number(minInput.value))
		if (clampedValue !== minInput.value) {
			minInput.value = clampedValue
		}
	} else {
		// Ensure empty fields become null
		minInput.value = null
	}
}

function onMaxInputBlur() {
	// Only clamp if the field has a value, otherwise keep it null
	if (
		maxInput.value !== null &&
		maxInput.value !== undefined &&
		String(maxInput.value).trim() !== ''
	) {
		const clampedValue = validateAndClampMax(Number(maxInput.value))
		if (clampedValue !== maxInput.value) {
			maxInput.value = clampedValue
		}
	} else {
		// Ensure empty fields become null
		maxInput.value = null
	}
}

watch([minInput, maxInput], ([newMin, newMax]) => {
	// Convert empty strings to null and ensure we have numbers
	const parsedMin =
		// @ts-ignore
		newMin === '' || newMin === null || newMin === undefined ? null : Number(newMin)
	const parsedMax =
		// @ts-ignore
		newMax === '' || newMax === null || newMax === undefined ? null : Number(newMax)

	// Only clamp non-null values to bounds
	const clampedMin = parsedMin === null ? null : validateAndClampMin(parsedMin)
	const clampedMax = parsedMax === null ? null : validateAndClampMax(parsedMax)

	// Update the input refs if values were clamped (but only for non-null values)
	if (parsedMin !== null && clampedMin !== parsedMin) {
		minInput.value = clampedMin
	}
	if (parsedMax !== null && clampedMax !== parsedMax) {
		maxInput.value = clampedMax
	}

	emit('update:modelValue', [clampedMin, clampedMax])
	emit('change', [clampedMin, clampedMax])
})
</script>

<template>
	<div class="flex gap-2">
		<div
			@click="focusMaxInput"
			class="rounded-sm bg-primary-700 flex gap-1 items-center overflow-hidden"
		>
			<div class="bg-primary-600 px-1 h-full flex items-center">
				<Icon icon="tabler:math-equal-lower" />
			</div>
			<input
				v-model="maxInput"
				@blur="onMaxInputBlur"
				class="border-none outline-none w-16"
				type="number"
				ref="maxInputRef"
				:min="props.minVal ?? -1"
				:max="props.maxVal ?? 5000"
			/>
		</div>
		<div
			@click="focusMinInput"
			class="rounded-sm bg-primary-700 flex gap-1 items-center overflow-hidden"
		>
			<div class="bg-primary-600 px-1 h-full flex items-center">
				<Icon icon="tabler:math-equal-greater" />
			</div>
			<input
				v-model="minInput"
				@blur="onMinInputBlur"
				class="border-none outline-none w-16"
				type="number"
				ref="minInputRef"
				:min="props.minVal ?? -1"
				:max="props.maxVal ?? 5000"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
input[type='number'] {
	/* Chrome, Safari, Edge, Opera */
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	-moz-appearance: textfield;
	appearance: textfield;
}
</style>
