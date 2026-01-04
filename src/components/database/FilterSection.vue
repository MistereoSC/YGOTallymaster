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
	<div class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col">
		<h3 class="font-bold m-0 gap-2 grid grid-cols-[auto_1fr_auto]">
			<Button
				icon="material-symbols:reset-settings-outline-rounded"
				rounded
				size="small"
				@click="emit('reset')"
			/>
			<span>{{ title }}</span>
			<ToggleSwitch
				v-if="hasOperandToggle && operand"
				:duo-labels="['AND', 'OR']"
				:model-value="operand === 'AND'"
				@toggle="emit('toggle-operand')"
			/>
			<span v-else-if="operand" class="text-contrast-400">({{ operand }})</span>
		</h3>
		<div class="flex gap-3 flex-wrap items-center justify-center">
			<slot />
		</div>
	</div>
</template>
