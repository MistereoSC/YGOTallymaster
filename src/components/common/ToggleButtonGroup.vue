<script lang="ts" setup generic="T extends string | number">
import {computed} from 'vue'
import ToggleButton from '@/components/common/ToggleButton.vue'

const props = defineProps<{
	options: T[] | Record<string, T>
	modelValue: T[]
	/** Fixed width class for items (e.g., 'w-8', 'w-13') */
	itemWidth?: string
}>()

const emit = defineEmits<{
	(e: 'toggle', value: T): void
}>()

const optionsList = computed(() => {
	if (Array.isArray(props.options)) return props.options
	return Object.values(props.options)
})
</script>

<template>
	<ToggleButton
		v-for="option in optionsList"
		:key="option"
		:model-value="modelValue.includes(option)"
		@toggle="emit('toggle', option)"
	>
		<slot :option="option">
			<span class="font-bold text-sm" :class="itemWidth">{{ option }}</span>
		</slot>
	</ToggleButton>
</template>
