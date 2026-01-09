<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'

const props = defineProps<{
	title: string
	operand?: 'AND' | 'OR' | null
	hasOperandToggle?: boolean
}>()

const emit = defineEmits<{
	(e: 'reset'): void
	(e: 'toggle-operand'): void
}>()
</script>

<template>
	<div class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600">
		<div
			class="px-3 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between"
			:class="{'grid grid-cols-[1fr_auto_1fr]': props.hasOperandToggle && props.operand}"
		>
			<div class="flex items-center gap-2">
				<span class="font-semibold text-contrast-600">{{ title }}</span>
				<span
					v-if="props.operand && !props.hasOperandToggle"
					class="text-xs px-1.5 py-0.5 rounded bg-primary-600 text-contrast-400"
				>
					{{ props.operand }}
				</span>
			</div>
			<ToggleSwitch
				v-if="props.hasOperandToggle && props.operand"
				:duo-labels="['AND', 'OR']"
				:model-value="props.operand === 'AND'"
				@toggle="emit('toggle-operand')"
			/>
			<span class="flex justify-end">
				<Button
					icon="material-symbols:refresh-rounded"
					rounded
					size="small"
					@click="emit('reset')"
				/>
			</span>
		</div>
		<div class="p-3 flex gap-2 flex-wrap items-center justify-center">
			<slot />
		</div>
	</div>
</template>
