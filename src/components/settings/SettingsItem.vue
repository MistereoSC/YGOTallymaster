<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {onMounted} from 'vue'

const props = defineProps<{
	icon: string
	iconColorClass?: string
	title: string
	description: string
}>()
const emit = defineEmits([])
onMounted(() => {
	return
})
</script>

<template>
	<div
		class="flex items-start gap-4 p-3 rounded-md bg-primary-700/50 hover:bg-primary-700 transition-colors"
	>
		<div
			class="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center shrink-0"
		>
			<Icon
				:icon="props.icon"
				class="text-xl"
				:class="props.iconColorClass || 'text-accent-400'"
			/>
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h3 class="font-medium text-contrast-700">{{ props.title }}</h3>
					<p class="text-sm text-contrast-500 mt-0.5">
						{{ props.description }}
					</p>
				</div>
				<div>
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
