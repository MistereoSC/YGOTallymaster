import {ref, onMounted} from 'vue'

export type Theme = 'dark' | 'light'

export const themes: Record<Theme, {name: string; description: string}> = {
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
	const currentTheme = ref<Theme>('dark')

	const setTheme = (theme: Theme) => {
		currentTheme.value = theme

		// Update the HTML class for the new Tailwind v4 theme system
		if (theme === 'light') {
			document.documentElement.classList.add('light')
		} else {
			document.documentElement.classList.remove('light')
		}

		localStorage.setItem('theme', theme)
	}

	const toggleTheme = () => {
		const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
	}

	const initTheme = () => {
		const savedTheme = localStorage.getItem('theme') as Theme
		if (savedTheme && themes[savedTheme]) {
			setTheme(savedTheme)
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
