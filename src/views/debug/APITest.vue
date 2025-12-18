<script lang="ts" setup>
import Paths from '../../libs/Paths'
import {getConfig, setConfig} from '../../libs/Config'
import {performDBUpdate} from '../../libs/Updater'

import {onMounted, ref} from 'vue'
onMounted(() => {
	return
})

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

const debugOutput = ref('')
</script>

<template>
	<div class="flex flex-wrap gap-4 p-4">
		<button
			class="bg-primary-700 rounded-md shadow-md p-2"
			@click="onTestPath"
		>
			Copy Path
		</button>
		<button
			class="bg-primary-700 rounded-md shadow-md p-2"
			@click="onTestConfig"
		>
			Test Config Read
		</button>
	</div>
	<div class="w-full p-8">
		Test Output:
		<div class="bg-primary-600 p-2 rounded-lg min-h-48 whitespace-pre-line">
			{{ debugOutput }}
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
