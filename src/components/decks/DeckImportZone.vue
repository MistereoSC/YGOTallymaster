<script lang="ts" setup>
import {useToast} from '@/composables/useToast'
import {validateYdkContent, ydkToJsonIds} from '@/libs/DeckParsers'
import {TDeckData} from '@/libs/Decks'
import Files, {RUnsafePathCharactersRegex} from '@/libs/Files'
import {Icon} from '@iconify/vue'
import {useDropZone} from '@vueuse/core'
import {useTemplateRef} from 'vue'

const props = defineProps<{
	existingDecksNames: string[]
}>()
const emit = defineEmits<{
	(e: 'importDeck', deck: TDeckData): void
}>()

const {addToast} = useToast()
const dropZoneRef = useTemplateRef('dropZoneRef')
const {isOverDropZone} = useDropZone(dropZoneRef, {
	onDrop,
	multiple: true,
	preventDefaultForUnhandled: false,
})

function onDrop(files: File[] | null) {
	if (files) {
		const ydkFiles = files.filter((file) => file.name.endsWith('.ydk'))
		if (ydkFiles.length === 0) {
			addToast('No .ydk files along dropped files', 'error', 4000)
			return
		} else {
			const diff = files.length - ydkFiles.length
			addToast(`Ignored ${diff} non-.ydk file(s)`, 'error', 3000)
		}
		for (const file of ydkFiles) {
			const reader = new FileReader()
			reader.onload = (e) => {
				const content = e.target?.result
				if (typeof content === 'string') {
					const deckData = _importYdkFile(content, file.name)
					if (deckData) {
						emit('importDeck', deckData)
					} else {
						addToast(
							`Failed to import ${file.name}: Invalid file format`,
							'error',
							4000
						)
					}
				}
			}
			reader.readAsText(file)
		}
	}
}

function _importYdkFile(fileContent: string, fileName: string) {
	const valid = validateYdkContent(fileContent)
	if (valid) {
		const deckData = ydkToJsonIds(fileContent)
		const safeName = fileName.split(/\./)[0].replace(RUnsafePathCharactersRegex, '')
		deckData.name = safeName
		// Avoid name collision by addint (num) suffix. Example: If "MyDeck" exists, the new deck should be called "MyDeck (1)"". If that also already exists, it should be called "MyDeck (2)" etc.
		let uniqueName = deckData.name
		let counter = 1
		while (props.existingDecksNames.includes(uniqueName)) {
			uniqueName = `${deckData.name} (${counter})`
			counter++
		}
		deckData.name = uniqueName
		return deckData
	} else return null
}

async function importYdkFileDialog() {
	try {
		const fsDialogOptions = {
			filters: [{name: 'YDK Files', extensions: ['ydk']}],
			properties: ['openFile'] as const,
		}
		const e = await Files.readFileFromDialog(fsDialogOptions)
		if (e.success && e.data) {
			const valid = validateYdkContent(e.data)
			if (!valid) {
				addToast('Invalid .ydk file format', 'error', 3000)
				return
			}
			const deckName = e.name?.split(/\./)[0] || 'imported_deck.ydk'
			const deckData = _importYdkFile(e.data, deckName)
			if (deckData) {
				emit('importDeck', deckData)
			} else {
				addToast('Failed to import .ydk file', 'error', 3000)
			}
		} else {
			addToast('Failed to import .ydk file', 'error', 3000)
		}
	} catch (err) {
		console.error('Error importing .ydk file:', err)
		addToast('Failed to import .ydk file', 'error', 3000)
		return
	}
}
</script>

<template>
	<div
		class="h-full w-full rounded-lg bg-primary-700/50 cursor-pointer shadow-lg transition-all duration-200 hover:bg-primary-600/70 border-2 border-dashed border-primary-500 hover:border-accent-500/50 group"
		ref="dropZoneRef"
		:class="{'bg-primary-600/70! border-accent-500/50!': isOverDropZone}"
		@click="() => importYdkFileDialog()"
	>
		<div class="select-none h-full w-full flex justify-center items-center flex-col">
			<div
				class="w-8 h-8 rounded-full bg-primary-600 group-hover:bg-accent-500/20 flex items-center justify-center transition-colors"
			>
				<Icon
					icon="material-symbols:arrow-upload-ready-rounded"
					class="text-2xl text-contrast-500 group-hover:text-accent-400 transition-colors"
					:class="{'text-accent-400!': isOverDropZone}"
				/>
			</div>
			<span
				class="font-semibold text-contrast-500 group-hover:text-contrast-600 transition-colors"
			>
				Import Deck
			</span>
			<span
				class="text-sm font-semibold text-contrast-400 group-hover:text-contrast-600 transition-colors"
			>
				Drop .ydk files here
			</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
