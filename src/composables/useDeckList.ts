import {
	createDeckFile,
	getSavedDeckFolders,
	renameDeckFile,
	saveDeckFile,
	TDeckData,
	TDeckFolder,
	deleteDeckFile,
	createDeckFolder,
	deleteDeckFolder,
	renameDeckFolder,
	moveDeckToFolder,
	DEFAULT_DECK_FOLDER,
} from '@/libs/Decks'
import {TCardData, TFrameType} from '@/libs/interfaces/YGOProInterfaces'
import {ref} from 'vue'

const initialized = ref<'uninitialized' | 'loading' | 'ready'>('uninitialized')
const deckFolders = ref([] as Array<TDeckFolder>)

const useDeckList = () => {
	if (initialized.value === 'uninitialized') {
		initialized.value = 'loading'
		_init()
	}
	async function _init() {
		deckFolders.value = await getSavedDeckFolders()
		initialized.value = 'ready'
	}

	/**
	 * Ensures the folder exists in the deckFolders array.
	 * Creates it if it doesn't exist (for Default folder, adds to front).
	 */
	function _ensureFolderExists(folderName: string): TDeckFolder {
		let folder = deckFolders.value.find((f) => f.name === folderName)
		if (!folder) {
			folder = {name: folderName, decks: []}
			if (folderName === DEFAULT_DECK_FOLDER) {
				deckFolders.value.unshift(folder)
			} else {
				deckFolders.value.push(folder)
			}
		}
		return folder
	}

	// --------------------------------------------------------
	// #region Folder Operations
	// --------------------------------------------------------

	async function createFolder(folderName: string) {
		const success = await createDeckFolder(folderName)
		if (!success) throw new Error('Error while creating deck folder')
		deckFolders.value.unshift({name: folderName, decks: []})
	}

	async function deleteFolder(folderName: string) {
		if (folderName === DEFAULT_DECK_FOLDER) return
		const success = await deleteDeckFolder(folderName)
		if (success) {
			const index = deckFolders.value.findIndex((f) => f.name === folderName)
			if (index !== -1) {
				deckFolders.value.splice(index, 1)
			}
		}
	}

	async function renameFolder(oldName: string, newName: string) {
		if (oldName === DEFAULT_DECK_FOLDER) return
		const success = await renameDeckFolder(oldName, newName)
		if (success) {
			const folder = deckFolders.value.find((f) => f.name === oldName)
			if (folder) {
				folder.name = newName
			}
		}
	}

	// --------------------------------------------------------
	// #region Deck Operations
	// --------------------------------------------------------

	async function createDeck(
		deckName: string,
		deckData?: TDeckData,
		folderName: string = DEFAULT_DECK_FOLDER
	) {
		const s = await createDeckFile(deckName, deckData, folderName)
		if (!s) throw new Error('Error while creating YDK file')
		const folder = _ensureFolderExists(folderName)
		folder.decks.push(s)
		return s
	}

	async function saveDeck(
		deck: TDeckData,
		folderName: string = DEFAULT_DECK_FOLDER,
		renamedFrom?: string
	) {
		const folder = deckFolders.value.find((f) => f.name === folderName)
		if (!folder) return

		const deckNames = folder.decks.map((d) => d.name)
		// If renaming, check for name conflicts, revert to old name if conflict found
		if (renamedFrom && renamedFrom !== deck.name && deckNames.includes(deck.name)) {
			deck.name = renamedFrom
		} else if (renamedFrom && renamedFrom !== deck.name) {
			await renameDeckFile(renamedFrom, deck.name, folderName)
		}

		await saveDeckFile(deck, folderName)
		const index = folder.decks.findIndex((d) => d.name === (renamedFrom || deck.name))
		if (index !== -1) {
			folder.decks[index] = deck
		}
	}

	async function deleteDeck(deckName: string, folderName: string = DEFAULT_DECK_FOLDER) {
		const folder = deckFolders.value.find((f) => f.name === folderName)
		if (!folder) return

		const index = folder.decks.findIndex((d) => d.name === deckName)
		if (index === -1) return
		folder.decks.splice(index, 1)
		await deleteDeckFile(deckName, folderName)
	}

	async function renameDeck(
		oldName: string,
		newName: string,
		folderName: string = DEFAULT_DECK_FOLDER
	) {
		const folder = deckFolders.value.find((f) => f.name === folderName)
		if (!folder) return

		const index = folder.decks.findIndex((d) => d.name === oldName)
		if (index === -1) return
		folder.decks[index].name = newName
		await renameDeckFile(oldName, newName, folderName)
	}

	async function moveDeck(deckName: string, oldFolderName: string, newFolderName: string) {
		if (oldFolderName === newFolderName) return

		const success = await moveDeckToFolder(deckName, oldFolderName, newFolderName)
		if (success) {
			const oldFolder = deckFolders.value.find((f) => f.name === oldFolderName)
			const newFolder = _ensureFolderExists(newFolderName)

			if (oldFolder) {
				const deckIndex = oldFolder.decks.findIndex((d) => d.name === deckName)
				if (deckIndex !== -1) {
					const deck = oldFolder.decks[deckIndex]
					oldFolder.decks.splice(deckIndex, 1)
					newFolder.decks.push(deck)
				}
			}
		}
	}

	// --------------------------------------------------------
	// #region Helpers
	// --------------------------------------------------------

	function getAllDecks(): TDeckData[] {
		return deckFolders.value.flatMap((f) => f.decks)
	}

	function getDeckCount(): number {
		return deckFolders.value.reduce((acc, f) => acc + f.decks.length, 0)
	}

	return {
		deckFolders,
		initialized,
		// Folder operations
		createFolder,
		deleteFolder,
		renameFolder,
		// Deck operations
		createDeck,
		saveDeck,
		deleteDeck,
		renameDeck,
		moveDeck,
		// Helpers
		getAllDecks,
		getDeckCount,
		DEFAULT_DECK_FOLDER,
	}
}

export {useDeckList}

const frameTypeSortOrder: Record<string, number> = {
	link: 0,
	xyz: 1,
	xyz_pendulum: 2,
	synchro: 3,
	synchro_pendulum: 4,
	fusion: 5,
	fusion_pendulum: 6,
	ritual: 7,
	// Other monster types will get 8
	spell: 9,
	trap: 10,
}

export function sortByDeckOrder(cards: TCardData[]) {
	return [...cards].sort((a, b) => {
		const frameOrderA = _getFrameTypeOrder(a.frameType)
		const frameOrderB = _getFrameTypeOrder(b.frameType)
		if (frameOrderA !== frameOrderB) {
			return frameOrderA - frameOrderB
		}

		const atkA = a.atk ?? -1
		const atkB = b.atk ?? -1
		if (atkA !== atkB) {
			return atkB - atkA
		}

		return a.name.localeCompare(b.name)
	})

	function _getFrameTypeOrder(frameType: TFrameType): number {
		if (frameType in frameTypeSortOrder) {
			return frameTypeSortOrder[frameType]
		}
		// All other monster frame types
		if (frameType !== 'spell' && frameType !== 'trap') {
			return 8
		}
		return frameTypeSortOrder[frameType]
	}
}
