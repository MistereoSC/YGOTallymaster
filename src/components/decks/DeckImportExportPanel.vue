<script lang="ts" setup>
import {TDeckCardsPopulated} from '@/libs/Decks'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import {
	exportPopulatedToMarketString,
	exportPopulatedToReadableDeck,
	jsonIdsToYdk,
	validateYdkContent,
} from '@/libs/DeckParsers'
import {useToast} from '@/composables/useToast'
import {getOwnedCards} from '@/composables/useOwnedCards'
import Files from '@/libs/Files'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'

const {addToast} = useToast()
const props = defineProps<{
	deckCards: TDeckCardsPopulated
	deckName: string
}>()
const emit = defineEmits<{
	(e: 'ydkImported', ydkContent: string): void
}>()

// ---------------------------------------------------------
// #region Export Functions
// ---------------------------------------------------------

async function clipboardDeck() {
	try {
		const list = exportPopulatedToReadableDeck(props.deckCards)
		await navigator.clipboard.writeText(list)
		addToast('Deck list copied to clipboard!', 'success', 3000)
	} catch (err) {
		addToast('Failed to copy deck list to clipboard', 'error', 3000)
		console.error('Clipboard error:', err)
	}
}

async function clipboardUnowned() {
	try {
		const list = await _getOwnedMarketString()
		await navigator.clipboard.writeText(list)
		addToast('Card list copied to clipboard!', 'success', 3000)
	} catch (err) {
		addToast('Failed to copy unowned deck list to clipboard', 'error', 3000)
		console.error('Clipboard error:', err)
	}
}

async function exportYDKFile() {
	const newDeckData = {
		name: props.deckName,
		comment: 'Created with YGO Tallymaster',
		main: props.deckCards.main.map((card) => card.id),
		extra: props.deckCards.extra.map((card) => card.id),
		side: props.deckCards.side.map((card) => card.id),
	}
	const ydkFile = jsonIdsToYdk(newDeckData)

	try {
		const fsDialogOptions = {
			filters: [{name: 'YDK Files', extensions: ['ydk']}],
		}
		const e = await Files.writeFileFromDialog(`${props.deckName}.ydk`, ydkFile, fsDialogOptions)
		if (e.success) {
			addToast('Deck exported successfully!', 'success', 3000)
		} else {
			addToast('Failed to export .ydk file', 'error', 3000)
		}
	} catch (err) {
		console.error('Error exporting .ydk file:', err)
		addToast('Failed to export .ydk file', 'error', 3000)
		return
	}
}

async function exportReadableTxtFile() {
	const list = exportPopulatedToReadableDeck(props.deckCards)
	try {
		const fsDialogOptions = {
			filters: [{name: 'Text Files', extensions: ['txt']}],
		}
		const e = await Files.writeFileFromDialog(`${props.deckName}.txt`, list, fsDialogOptions)
		if (e.success) {
			addToast('Deck list exported successfully!', 'success', 3000)
		} else {
			addToast('Failed to export deck list', 'error', 3000)
		}
	} catch (err) {
		console.error('Error exporting readable deck list:', err)
		addToast('Failed to export deck list', 'error', 3000)
		return
	}
}

async function exportUnownedTxtFile() {
	const list = await _getOwnedMarketString()
	try {
		const fsDialogOptions = {
			filters: [{name: 'Text Files', extensions: ['txt']}],
		}
		const e = await Files.writeFileFromDialog(
			`${props.deckName}_missing.txt`,
			list,
			fsDialogOptions
		)
		if (e.success) {
			addToast('Card list exported successfully!', 'success', 3000)
		} else {
			addToast('Failed to export card list', 'error', 3000)
		}
	} catch (err) {
		console.error('Error exporting card list:', err)
		addToast('Failed to export card list', 'error', 3000)
		return
	}
}

// #endregion
// ---------------------------------------------------------
// #region Import Functions
// ---------------------------------------------------------

async function importYdkFile() {
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
			emit('ydkImported', e.data)
		} else {
			addToast('Failed to import .ydk file', 'error', 3000)
		}
	} catch (err) {
		console.error('Error importing .ydk file:', err)
		addToast('Failed to import .ydk file', 'error', 3000)
		return
	}
}

// #endregion
// ---------------------------------------------------------
// #region Helper Functions
// ---------------------------------------------------------

async function _getOwnedMarketString() {
	const cardArray = [...props.deckCards.main, ...props.deckCards.extra, ...props.deckCards.side]
	const ownedCards = await getOwnedCards()

	// Track remaining owned count for each card as we iterate
	const remainingOwned = new Map<number, number>()

	// Build unowned cards array preserving original order
	const unownedCards: TCardData[] = []
	for (const card of cardArray) {
		// Initialize remaining owned count on first encounter
		if (!remainingOwned.has(card.id)) {
			remainingOwned.set(card.id, ownedCards[card.id] ?? 0)
		}

		const remaining = remainingOwned.get(card.id)!
		if (remaining > 0) {
			// This copy is owned, decrement remaining
			remainingOwned.set(card.id, remaining - 1)
		} else {
			// This copy is not owned, add to unowned list
			unownedCards.push(card)
		}
	}

	return exportPopulatedToMarketString(unownedCards)
}

// #endregion
// ---------------------------------------------------------
</script>

<template>
	<div class="p-4 flex flex-col gap-2">
		<SettingsSection title="Export Deck" icon="tabler:package-export">
			<SettingsItem
				icon="tabler:file"
				title="Export to .ydk"
				class="cursor-pointer"
				description="Export deck as .ydk file"
				@click="() => exportYDKFile()"
			/>
			<SettingsItem
				icon="tabler:file-text-filled"
				title="Export Deck List"
				class="cursor-pointer"
				description="Export deck as readable .txt file"
				@click="() => exportReadableTxtFile()"
			/>
			<SettingsItem
				icon="tabler:clipboard-list-filled"
				title="Clipboard Deck List"
				class="cursor-pointer"
				description="Copy readable deck list to clipboard"
				@click="() => clipboardDeck()"
			/>
			<SettingsItem
				icon="tabler:heart-broken-filled"
				title="Export Unowned List"
				class="cursor-pointer"
				description="Export unowned cards as readable .txt file"
				@click="() => exportUnownedTxtFile()"
			/>
			<SettingsItem
				icon="tabler:clipboard-list-filled"
				title="Clipboard Unowned List"
				class="cursor-pointer"
				description="Copy unowned cards list to clipboard"
				@click="() => clipboardUnowned()"
			/>
		</SettingsSection>
		<SettingsSection title="Import Deck" icon="tabler:package-import">
			<SettingsItem
				icon="tabler:file-import"
				title="Import from .ydk"
				description="Import deck from .ydk file"
				class="cursor-pointer"
				@click="() => importYdkFile()"
			/>
		</SettingsSection>
	</div>
</template>

<style lang="scss" scoped></style>
