<script lang="ts" setup>
import {Icon} from '@iconify/vue'

const props = defineProps<{
	icon: string
	iconColorClass?: string
	title: string
	description?: string
}>()
</script>

<template>
	<section class="bg-primary-800 rounded-lg border border-primary-600 overflow-hidden">
		<div class="px-4 py-2 bg-primary-700 border-b border-primary-600">
			<h2 class="text-lg font-semibold text-contrast-700 flex items-center gap-2">
				<Icon :icon="props.icon" :class="props.iconColorClass || 'text-accent-400'" />
				{{ props.title }}
			</h2>
			<p v-if="description" class="text-sm text-contrast-500 mt-0.5">{{ props.description }}</p>
		</div>

		<div class="p-4 flex flex-col gap-5">
			<slot></slot>
		</div>
	</section>
</template>

<style lang="scss" scoped></style>
