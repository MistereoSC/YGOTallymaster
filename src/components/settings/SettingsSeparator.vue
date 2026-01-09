<script lang="ts" setup>
import {Icon} from '@iconify/vue'

const props = defineProps<{
	label?: string
	icon?: string
	iconColorClass?: string
}>()
</script>

<template>
	<div class="border-b border-primary-600 -mx-4">
		<span class="pl-4 flex gap-2 items-center text-lg">
			<Icon
				v-if="props.icon"
				:icon="props.icon"
				:class="props.iconColorClass || 'text-accent-400'"
			/>
			<h2 v-if="props.label" class="font-semibold text-contrast-800">
				{{ props.label }}
			</h2>
		</span>
	</div>
</template>

<style lang="scss" scoped></style>
