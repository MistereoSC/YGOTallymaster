export const APP_VERSION: Readonly<string> = '1.0.0'
const DEFAULT_CONFIG: Readonly<TConfig> = {
	appVer: APP_VERSION,
	dbVer: '0',
	autoUpdate: true,
	theme: 'dark' as TTheme,
}

let config = null as null | TConfig
import {TTheme} from '@/composables/useTheme'
import Files from './Files'
export async function getConfig(): Promise<TConfig | null> {
	if (config) return config
	const exists = (await Files.exists('config.json')).exists
	if (!exists) {
		const writeResult = await Files.write<TConfig>('config.json', DEFAULT_CONFIG)
		if (!writeResult) {
			console.error('ERR:: Failed to create default config')
			return null
		}
		return DEFAULT_CONFIG
	}

	const cfg = await Files.read<TConfig>('config.json')
	if (cfg) {
		config = cfg
		return config
	}
	console.error('ERR:: Failed to load config')
	return null
}

export async function setConfig(options: Partial<TConfig>): Promise<boolean> {
	const currentConfig = await getConfig()
	if (!currentConfig) return false
	const newConfig = {...currentConfig, ...options}
	const writeResult = await Files.write<TConfig>('config.json', newConfig)
	if (!writeResult) {
		console.error('ERR:: Failed to write config')
		return false
	}
	config = newConfig
	return true
}

export type TConfig = {
	appVer: string
	dbVer: string
	autoUpdate: boolean
	theme: TTheme
}
