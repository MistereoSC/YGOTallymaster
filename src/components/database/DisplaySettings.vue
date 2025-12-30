<script lang="ts" setup>
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {onMounted} from 'vue'
import Checkbox from '@/components/common/Checkbox.vue'

const store = useDatabaseSettings()
const props = defineProps<{
	message?: string
}>()
const emit = defineEmits([])
onMounted(() => {
	return
})

enum EListSize {
	'tiny' = 'Tiny',
	'small' = 'Small',
	'medium' = 'Medium',
	'large' = 'Large',
}
</script>

<template>
	<div>
		<h3 class="font-bold text-xl">Settings</h3>
		<div class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col">
			<Checkbox
				label="Gray Out Unowned Cards"
				:modelValue="store.settings.value?.grayUnowned"
				@change="store.toggle.grayUnowned"
			/>
			<Checkbox
				label="Always Show Owned Numbers"
				:modelValue="store.settings.value?.showOwnedNumbers"
				@change="store.toggle.showOwnedNumbers"
			/>
			<Checkbox
				label="Display as List"
				:modelValue="store.settings.value?.displayAsList"
				@change="store.toggle.displayAsList"
			/>
			<div
				class="p-2 rounded-md bg-primary-800 grid grid-cols-[auto_1fr] gap-2 items-center"
			>
				<span>List Size</span>
				<select
					:value="store.settings.value?.listSize"
					@change="(e) => store.set.listSize((e.target as HTMLSelectElement).value as keyof typeof EListSize)"
					class="bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
				>
					<option
						v-for="(label, key) in EListSize"
						:key="key"
						:value="key"
					>
						{{ label }}
					</option>
				</select>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
