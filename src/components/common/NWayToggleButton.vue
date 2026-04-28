<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {ref, watch} from 'vue'
import Button from './Button.vue'

const props = defineProps<{
	modelValue?: string
	values: string[]
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'toggle', value: string): void
}>()

const activeValue = ref(props.modelValue ?? props.values[0] ?? '')
function onToggle() {
	const currentIndex = props.values.indexOf(activeValue.value)
	const nextIndex = (currentIndex + 1) % props.values.length
	activeValue.value = props.values[nextIndex]
	emit('update:modelValue', activeValue.value)
	emit('toggle', activeValue.value)
}

watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal !== undefined) {
			activeValue.value = newVal
		}
	}
)
</script>

<template>
	<Button class="rounded-full! py-0.5!" @click="onToggle">
		<Icon icon="mdi:sync" />
		<span class="font-semibold min-w-[4ch]">
			{{ activeValue }}
		</span>
	</Button>
</template>

<style lang="scss" scoped></style>
