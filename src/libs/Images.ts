import Files from './Files'
import Path from './Paths'
export interface ImageResult {
	success: boolean
	localPath?: string
	error?: string
}

export async function loadImage(
	cardId: string | number,
	size: 'small' | 'normal' | 'cropped' = 'small'
): Promise<ImageResult> {
	try {
		let imageUrl = 'https://images.ygoprodeck.com/images/cards'
		if (size === 'small') imageUrl += '_small'
		else if (size === 'cropped') imageUrl += '_cropped'
		imageUrl += `/${cardId}.jpg`

		const appPath = await Path.AppRoot()
		const localPath = `/images/cards/${size}/${cardId}.jpg`
		const fullLocalPath = appPath + localPath

		// Check if image already exists locally
		const existsResult = (await Files.exists(localPath)).exists
		if (existsResult) {
			// console.debug('Image:::Download::Card already on disk', cardId)
			return {success: true, localPath: fullLocalPath}
		}

		// Image doesn't exist, download it
		// console.debug('Image:::Download::Downloading image for card', cardId)
		const downloadResult = await window.electronImage.downloadImage(
			imageUrl,
			fullLocalPath
		)
		if (!downloadResult.success) {
			throw new Error(`Failed to download image: ${downloadResult.error}`)
		}

		return {success: true, localPath: fullLocalPath}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error)
		console.error(`Error loading image for card ${cardId}:`, errorMessage)
		return {success: false, error: errorMessage}
	}
}

export async function getImageUrl(
	cardId: string | number,
	size: 'small' | 'normal' = 'small'
): Promise<string | null> {
	const result = await loadImage(cardId, size)
	if (!result.success || !result.localPath) {
		return null
	}

	// Get image as data URL to avoid file:// protocol issues
	const dataUrlResult = await window.electronImage.getDataUrl(
		result.localPath
	)
	if (dataUrlResult.success && dataUrlResult.data) {
		return dataUrlResult.data
	}

	return null
}
