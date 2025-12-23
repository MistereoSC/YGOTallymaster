<script lang="ts" setup>
const props = defineProps<{
	modelValue: boolean
	duoLabels?: [string, string]
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void
	(e: 'toggle', value: boolean): void
}>()

function onClick() {
	emit('update:modelValue', !props.modelValue)
	emit('toggle', !props.modelValue)
}
</script>

<template>
	<div class="flex gap-2">
		<span
			:class="{'text-contrast-400': props.modelValue}"
			v-if="duoLabels"
			>{{ duoLabels[1] }}</span
		>
		<div class="cursor-pointer relative" @click="onClick">
			<div
				class="w-10 h-6 rounded-full bg-accent-500 relative transition-colors"
			>
				<div
					class="w-4 h-4 rounded-full bg-accent-200 absolute top-1 left-1 transition-transform"
					:class="{'translate-x-4': props.modelValue}"
				/>
			</div>
		</div>
		<span
			:class="{'text-contrast-400': !props.modelValue}"
			v-if="duoLabels"
			>{{ duoLabels[0] }}</span
		>
		<span v-else>Toggle</span>
	</div>
</template>

<style lang="scss" scoped></style>
