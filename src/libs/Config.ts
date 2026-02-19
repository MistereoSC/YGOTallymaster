export const APP_VERSION: Readonly<string> = '1.5.2'
const DEFAULT_CONFIG: Readonly<TConfig> = {
	appVer: APP_VERSION,
	dbVer: {
		en: '0',
		de: '0',
		fr: '0',
		it: '0',
		pt: '0',
	},
	autoUpdate: true,
	theme: 'dark' as TTheme,
}

let config = null as null | TConfig
import {TTheme} from '@/composables/useTheme'
import Files from './Files'
export async function getConfig() {
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
		config.oldVer = cfg.appVer
		config.appVer = APP_VERSION
		return config
	}
	console.error('ERR:: Failed to load config')
	return null
}

export async function setConfig(options: Partial<TConfig>): Promise<boolean> {
	const currentConfig = await getConfig()
	if (!currentConfig) return false
	const newConfig = {...currentConfig, ...options}
	delete newConfig.oldVer

	const writeResult = await Files.write<TConfig>('config.json', newConfig)
	if (!writeResult) {
		console.error('ERR:: Failed to write config')
		return false
	}
	config = newConfig
	return true
}

export async function _appIsUpToDate() {
	const cfg = await getConfig()
	if (!cfg) return false
	// @ts-ignore
	return {oldVer: cfg.oldVer, newVer: cfg.appVer, isUpToDate: cfg.oldVer === cfg.appVer}
}

export type TConfig = {
	appVer: string
	dbVer: {
		en: string
		de: string
		fr: string
		it: string
		pt: string
	}
	autoUpdate: boolean
	theme: TTheme
	oldVer?: string
}
