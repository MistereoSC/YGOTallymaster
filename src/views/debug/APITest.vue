<script lang="ts" setup>
import {ref} from 'vue'
import {getConfig} from '@/libs/Config'
import Paths from '@/libs/Paths'
import {__getAllViableValues} from '@/composables/useCardSearch'

async function onTestPath() {
	const rootPath = await Paths.AppRoot()
	debugOutput.value = `App Root Path: ${rootPath}`
	if (rootPath) {
		debugOutput.value += `\nPath copied to clipboard.`
		await navigator.clipboard.writeText(rootPath)
	}
}
async function onTestConfig() {
	const cfg = await getConfig()
	debugOutput.value = `Current Config:\n${JSON.stringify(cfg, null, 2)}`
}

const valueInput = ref('')
function onGetValues() {
	const t = __getAllViableValues(valueInput.value as any)
	debugOutput.value = t.join('\n')
}
const debugOutput = ref('')
</script>

<template>
	<div class="flex flex-wrap gap-4 p-4">
		<button
			class="bg-primary-700 rounded-md shadow-md p-2 cursor-pointer"
			@click="onTestPath"
		>
			Copy Path
		</button>
		<button
			class="bg-primary-700 rounded-md shadow-md p-2 cursor-pointer"
			@click="onTestConfig"
		>
			Test Config Read
		</button>

		<span>
			<button
				class="bg-primary-700 rounded-md shadow-md p-2 cursor-pointer"
				@click="onGetValues"
			>
				GET
			</button>
			<input
				class="bg-primary-600 rounded-md shadow-md p-2 ml-2"
				v-model="valueInput"
				placeholder="json key"
			/>
		</span>
	</div>
	<div class="w-full p-8">
		Test Output:
		<div class="bg-primary-600 p-2 rounded-lg min-h-48 whitespace-pre-line">
			{{ debugOutput }}
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
