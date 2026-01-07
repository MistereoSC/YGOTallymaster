import Files, {RUnsafePathCharactersRegex} from './Files'
import {TCardCollection, TCardSet} from './interfaces/CardSets'

const COLLECTIONS_PATH = 'userdata/collections/'

// ----------------------------------------------------
// #region Functions
// ----------------------------------------------------

export async function loadCollections() {
	const collectionDirs = await _loadCollectionDirs()
	const dirs = collectionDirs.map((dir) => dir.fileName)

	const collections = [] as TCardCollection[]
	for (const dirName of dirs) {
		const files = await _loadFilesFromDir(dirName)
		const sets = [] as TCardSet[]
		for (const file of files) {
			const data: TCardSet | null = await Files.read(
				`${COLLECTIONS_PATH}${dirName}/${file.fileName}${file.fileExtension}`
			)
			if (data) {
				data.name = file.fileName
				sets.push(data as TCardSet)
			}
		}
		collections.push({
			name: dirName,
			sets: sets,
		} as TCardCollection)
	}
	return collections
}

export async function createCollection(name: string) {
	const safeName = name.replace(RUnsafePathCharactersRegex, '')
	const dirPath = `${COLLECTIONS_PATH}${safeName}`
	const result = await Files.makeDir(dirPath)
	if (!result) throw new Error('Failed to create Collection Directory: ' + dirPath)
}

export async function deleteCollection(name: string) {
	const e = await Files.exists(`${COLLECTIONS_PATH}${name}`)
	if (!e.exists) return false

	const fullPath = `${COLLECTIONS_PATH}${name}`
	const result = await Files.removeDir(fullPath)

	if (!result) return false
	return true
}

export async function createSet(name: string, parentCollection: string) {
	const safeName = name.replace(RUnsafePathCharactersRegex, '')

	const colE = await Files.exists(`${COLLECTIONS_PATH}${parentCollection}`)
	if (!colE.exists) throw new Error('Parent Collection does not exist: ' + parentCollection)
	const setE = await Files.exists(`${COLLECTIONS_PATH}${parentCollection}/${safeName}.json`)
	if (setE.exists) throw new Error('Set already exists: ' + name)

	const newSet: TCardSet = {
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		cards: [],
	}
	const result = await Files.write(
		`${COLLECTIONS_PATH}${parentCollection}/${safeName}.json`,
		newSet
	)
	if (!result) throw new Error('Failed to create Set: ' + name)
	newSet.name = safeName
	return newSet
}

export async function deleteSet(setName: string, parentCollection: string) {
	const safeName = setName.replace(RUnsafePathCharactersRegex, '')
	const fullPath = `${COLLECTIONS_PATH}${parentCollection}/${safeName}.json`
	const e = await Files.exists(fullPath)
	if (!e.exists) return false
	const result = await Files.remove(fullPath)
	if (!result) return false
	return true
}

export async function saveSet(setName: string, parentCollection: string, set: TCardSet) {
	const safeName = setName.replace(RUnsafePathCharactersRegex, '')
	const fullPath = `${COLLECTIONS_PATH}${parentCollection}/${safeName}.json`
	delete set.name
	const result = await Files.write(fullPath, set)
	if (!result) throw new Error('Failed to save Set: ' + safeName)
}

export async function renameAndMoveSet(
	oldName: string,
	newName: string,
	oldParentCollection: string,
	newParentCollection?: string
) {
	const safeOldName = oldName.replace(RUnsafePathCharactersRegex, '')
	const safeNewName = newName.replace(RUnsafePathCharactersRegex, '')
	const oldPath = `${COLLECTIONS_PATH}${oldParentCollection}/${safeOldName}.json`
	const newPath = `${COLLECTIONS_PATH}${
		newParentCollection ?? oldParentCollection
	}/${safeNewName}.json`

	if (oldPath === newPath) return

	const e = await Files.exists(oldPath)
	if (!e.exists) return null

	const success = await Files.moveOrRename(oldPath, newPath)
	if (!success) return null
	return {path: newPath, name: safeNewName}
}

export async function renameCollection(oldName: string, newName: string) {
	const safeOldName = oldName.replace(RUnsafePathCharactersRegex, '')
	const safeNewName = newName.replace(RUnsafePathCharactersRegex, '')
	const oldPath = `${COLLECTIONS_PATH}${safeOldName}`
	const newPath = `${COLLECTIONS_PATH}${safeNewName}`
	if (oldPath === newPath) return false

	const e = await Files.exists(oldPath)
	if (!e.exists) return false
	const success = await Files.moveOrRename(oldPath, newPath)
	if (!success) return false
	return true
}

// #endregion
// ----------------------------------------------------
// #region Helper Functions
// ----------------------------------------------------

async function _loadCollectionDirs() {
	const e = await Files.exists(COLLECTIONS_PATH)
	if (!e.exists) return []
	const t = await Files.readDir(COLLECTIONS_PATH)
	if (!t) return []

	const dirs = t.filter((entry) => entry.isDirectory)
	dirs.sort((a, b) => {
		const dateA = new Date(a.creationDate).getTime()
		const dateB = new Date(b.creationDate).getTime()
		return dateB - dateA
	})
	return dirs
}

async function _loadFilesFromDir(collectionDir: string) {
	const e = await Files.exists(`${COLLECTIONS_PATH}${collectionDir}`)
	if (!e.exists) return []
	const t = await Files.readDir(`${COLLECTIONS_PATH}${collectionDir}`)
	if (!t) return []

	const files = t.filter((entry) => !entry.isDirectory && entry.fileExtension === '.json')
	files.sort((a, b) => {
		const dateA = new Date(a.creationDate).getTime()
		const dateB = new Date(b.creationDate).getTime()
		return dateB - dateA
	})
	return files
}

// #endregion
// ----------------------------------------------------
