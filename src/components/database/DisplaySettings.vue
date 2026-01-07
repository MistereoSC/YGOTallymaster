<script lang="ts" setup>
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import Checkbox from '@/components/common/Checkbox.vue'

const store = useDatabaseSettings()

enum EListSize {
	'tiny' = 'Tiny',
	'small' = 'Small',
	'medium' = 'Medium',
	'large' = 'Large',
}
enum EBanlistFormat {
	'none' = 'None',
	'ban_tcg' = 'TCG',
	'ban_ocg' = 'OCG',
	'ban_goat' = 'GOAT',
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

			<div class="grid grid-cols-[3fr_10fr] items-center">
				<span>List Size</span>
				<select
					:value="store.settings.value?.listSize"
					@change="(e) => store.set.listSize((e.target as HTMLSelectElement).value as keyof typeof EListSize)"
					class="bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500 w-full"
				>
					<option v-for="(label, key) in EListSize" :key="key" :value="key">
						{{ label }}
					</option>
				</select>
			</div>
			<div class="grid grid-cols-[3fr_10fr] items-center">
				<span>Banlist</span>
				<select
					:value="store.settings.value?.showBanlistFor"
					@change="(e) => store.set.showBanlistFor((e.target as HTMLSelectElement).value as keyof typeof EBanlistFormat)"
					class="bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500 w-full"
				>
					<option v-for="(label, key) in EBanlistFormat" :key="key" :value="key">
						{{ label }}
					</option>
				</select>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
