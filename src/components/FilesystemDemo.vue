<template>
	<div class="filesystem-demo">
		<h2>Filesystem Operations Demo</h2>

		<div class="actions">
			<button @click="checkCoreDataExists">Check Core Data</button>
			<button @click="createCoreData">Create Core Data</button>
			<button @click="loadCoreData">Load Core Data</button>
			<button @click="saveData">Save Data</button>
			<button @click="openFile">Open File</button>
			<button @click="saveFileAs">Save File As</button>
		</div>

		<div class="output" v-if="output">
			<h3>Output:</h3>
			<pre>{{ JSON.stringify(output, null, 2) }}</pre>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {
	existsCoreData,
	readCoreData,
	createCoreDataFile,
	writeCoreData,
	saveDataWithDialog,
	loadDataWithDialog,
} from '../libs/files/LocalData'

const output = ref<any>(null)

async function checkCoreDataExists() {
	const exists = await existsCoreData()
	output.value = {exists}
}

async function createCoreData() {
	const created = await createCoreDataFile()
	output.value = {created}
}

async function loadCoreData() {
	const data = await readCoreData()
	output.value = data
}

async function saveData() {
	const sampleData = {
		cards: [],
		decks: [],
		settings: {
			theme: 'dark',
			autoSave: true,
		},
		timestamp: new Date().toISOString(),
	}

	const result = await writeCoreData(sampleData)
	output.value = {saved: result}
}

async function openFile() {
	const result = await loadDataWithDialog()
	output.value = result
}

async function saveFileAs() {
	const sampleData = {
		exportedAt: new Date().toISOString(),
		cards: [
			{id: 1, name: 'Blue-Eyes White Dragon'},
			{id: 2, name: 'Dark Magician'},
		],
	}

	const result = await saveDataWithDialog(sampleData, 'exported-cards.json')
	output.value = result
}
</script>

<style scoped>
.filesystem-demo {
	padding: 20px;
}

.actions {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

button {
	padding: 8px 16px;
	background: #007acc;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

button:hover {
	background: #005a9e;
}

.output {
	background: #f5f5f5;
	padding: 15px;
	border-radius: 4px;
	border: 1px solid #ddd;
}

pre {
	margin: 0;
	white-space: pre-wrap;
}
</style>
