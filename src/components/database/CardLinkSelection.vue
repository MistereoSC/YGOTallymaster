<script lang="ts" setup>
import {TLinkMarkers} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	modelValue: TLinkMarkers[]
}>()
const emit = defineEmits<{
	(e: 'update:model-value', value: TLinkMarkers[]): void
	(e: 'change', value: TLinkMarkers[]): void
}>()

function toggleMarker(marker: TLinkMarkers) {
	const index = props.modelValue.indexOf(marker)
	let newValue: TLinkMarkers[] = []
	if (index === -1) {
		newValue = [...props.modelValue, marker]
	} else {
		newValue = props.modelValue.filter((m) => m !== marker)
	}
	emit('update:model-value', newValue)
	emit('change', newValue)
}
</script>

<template>
	<div class="grid grid-cols-3 grid-rows-3 w-24 h-24 relative pb-1 pr-1">
		<div
			class="absolute top-4.5 left-4.5 right-3.5 bottom-3.5 border-accent-900 border-4 rounded-sm"
		></div>

		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Top-Left'),
			}"
			@click="toggleMarker('Top-Left')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl rotate-45"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Top'),
			}"
			@click="toggleMarker('Top')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl rotate-90"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Top-Right'),
			}"
			@click="toggleMarker('Top-Right')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl rotate-135"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Left'),
			}"
			@click="toggleMarker('Left')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl rotate-0"
			/>
		</div>
		<span></span>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Right'),
			}"
			@click="toggleMarker('Right')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl rotate-180"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Bottom-Left'),
			}"
			@click="toggleMarker('Bottom-Left')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl -rotate-45"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Bottom'),
			}"
			@click="toggleMarker('Bottom')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl -rotate-90"
			/>
		</div>
		<div
			class="cursor-pointer hover:text-accent-300"
			:class="{
				'text-accent-500 ': modelValue.includes('Bottom-Right'),
			}"
			@click="toggleMarker('Bottom-Right')"
		>
			<Icon
				icon="material-symbols:arrow-left-rounded"
				class="text-4xl -rotate-135"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
