<template>
	<div>
		<button
			@click="toggleTheme"
			class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-800 hover:bg-primary-700 text-primary-50 transition-all duration-200 ease-in-out border border-primary-700 hover:border-accent-500/30"
		>
			<div class="flex items-center gap-1">
				<div class="flex gap-1">
					<div class="w-2 h-2 rounded-full bg-accent-500"></div>
					<div class="w-2 h-2 rounded-full bg-secondary-500"></div>
					<div class="w-2 h-2 rounded-full bg-tertiary-500"></div>
				</div>
			</div>
			<span class="text-sm font-medium">{{
				themes[currentTheme].name
			}}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import {useTheme} from '../composables/useTheme'

const {currentTheme, themes, toggleTheme} = useTheme()
</script>

<style scoped></style>
