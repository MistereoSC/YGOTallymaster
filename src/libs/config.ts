// -----------------------------------------------------------
// #region Paths
// -----------------------------------------------------------
const Path = {
	/**
	 * Gets the user data directory path (app-specific data)
	 * This is typically used for app-specific configuration and data
	 */
	async AppRoot(): Promise<string | null> {
		try {
			const result = await window.electronApp.getPath('userData')
			return result.success ? result.path! : null
		} catch (error) {
			console.error('Failed to get user data path:', error)
			return null
		}
	},

	/**
	 * Gets various system paths
	 */
}

// #endregion
// -----------------------------------------------------------
// #region Helper Functions
// -----------------------------------------------------------

async function getPath(
	pathName:
		| 'home'
		| 'appData'
		| 'userData'
		| 'sessionData'
		| 'temp'
		| 'exe'
		| 'module'
		| 'desktop'
		| 'documents'
		| 'downloads'
		| 'music'
		| 'pictures'
		| 'videos'
		| 'recent'
		| 'logs'
		| 'crashDumps'
): Promise<string | null> {
	try {
		const result = await window.electronApp.getPath(pathName)
		return result.success ? result.path! : null
	} catch (error) {
		console.error(`Failed to get ${pathName} path:`, error)
		return null
	}
}

// #endregion
// -----------------------------------------------------------

const Config = {
	Path,
}

export default Config
