/**
 * Composable for handling external links
 */
export const useExternalLinks = () => {
	/**
	 * Open a URL in the user's default browser
	 * @param url - The URL to open
	 */
	const openExternal = async (url: string): Promise<void> => {
		try {
			const result = await window.electronShell.openExternal(url)
			if (!result.success) {
				console.error('Failed to open external link:', result.error)
			}
		} catch (error) {
			console.error('Error opening external link:', error)
		}
	}

	/**
	 * Create a click handler for links
	 * @param url - The URL to open
	 */
	const createLinkHandler = (url: string) => {
		return (event: Event) => {
			event.preventDefault()
			openExternal(url)
		}
	}

	return {
		openExternal,
		createLinkHandler,
	}
}
