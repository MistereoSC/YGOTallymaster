import {ref, onMounted} from 'vue'
import {getConfig, setConfig} from '@/libs/Config'

export type TTheme = 'dark' | 'light'

export const themes: Record<TTheme, {name: string; description: string}> = {
	dark: {
		name: 'Dark',
		description: 'Default Dark Theme',
	},
	light: {
		name: 'Light',
		description: 'Light Theme',
	},
}

export function useTheme() {
	const currentTheme = ref<TTheme>('dark')

	const setTheme = async (theme: TTheme) => {
		currentTheme.value = theme

		// Update the HTML class for the new Tailwind v4 theme system
		if (theme === 'light') {
			document.documentElement.classList.add('light')
		} else {
			document.documentElement.classList.remove('light')
		}

		await setConfig({theme})
	}

	const toggleTheme = () => {
		const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
	}

	const initTheme = async () => {
		const config = await getConfig()
		const savedTheme = config?.theme
		if (savedTheme && themes[savedTheme]) {
			currentTheme.value = savedTheme
			// Apply theme to DOM without saving again
			if (savedTheme === 'light') {
				document.documentElement.classList.add('light')
			} else {
				document.documentElement.classList.remove('light')
			}
		} else {
			// Default to dark theme
			setTheme('dark')
		}
	}

	onMounted(() => {
		initTheme()
	})

	return {
		currentTheme,
		themes,
		setTheme,
		toggleTheme,
		initTheme,
	}
}
