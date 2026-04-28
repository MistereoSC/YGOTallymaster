<script lang="ts" setup>
import {computed} from 'vue'

interface IProps {
	colorClass?: string
	value: number
	total: number

	title?: string
	showPercentage?: boolean
	showPip?: boolean
	showValue?: boolean
	realPercentageTotal?: number
}
const props = withDefaults(defineProps<IProps>(), {
	showPip: false,
	showPercentage: true,
	showValue: true,
})
const emit = defineEmits([])

const percent = computed(() => {
	if (props.total === 0) return '0'
	return ((props.value / props.total) * 100).toFixed(1)
})

const realPercent = computed(() => {
	if (!props.realPercentageTotal) return '0'
	return ((props.value / props.realPercentageTotal) * 100).toFixed(1)
})
</script>

<template>
	<div class="flex flex-col gap-1">
		<div
			class="flex justify-between text-xs text-contrast-600"
			v-if="props.title || props.showPercentage || props.showValue"
		>
			<span class="flex items-center gap-1">
				<span
					class="w-2 h-2 rounded-full"
					:class="props.colorClass"
					v-if="props.showPip"
				></span>
				<span class="tracking-wider uppercase font-semibold text-contrast-600">{{
					props.title
				}}</span>
			</span>
			<span class="flex items-center gap-2">
				<span v-if="props.showValue">{{ props.value }}</span>
				<span
					class="text-contrast-500"
					v-if="props.showPercentage && $props.realPercentageTotal"
					>{{ realPercent }}%</span
				>
				<span class="text-contrast-500" v-else-if="props.showPercentage"
					>{{ percent }}%</span
				>
			</span>
		</div>
		<div class="h-2 rounded-full bg-primary-600 overflow-hidden">
			<div
				class="h-full rounded-full transition-all"
				:class="props.colorClass"
				:style="{
					width: percent + '%',
				}"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
