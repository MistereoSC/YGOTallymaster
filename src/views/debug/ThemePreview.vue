<script lang="ts" setup>
import ThemeSwitcher from '../../components/ThemeSwitcher.vue'
</script>

<template>
	<div class="p-4 min-h-screen">
		<ThemeSwitcher />

		<!-- Primary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Primary Colors
			</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-primary-50 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-primary-100 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-primary-200 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-primary-300 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-primary-400 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-primary-500 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-primary-600 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-primary-700 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-primary-800 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-primary-900 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					900
				</div>
			</div>
		</div>

		<!-- Accent Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Accent Colors (Blue)
			</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-accent-50 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-accent-100 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-accent-200 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-accent-300 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-accent-400 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-accent-500 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-accent-600 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-accent-700 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-accent-800 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-accent-900 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					900
				</div>
			</div>
		</div>

		<!-- Secondary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Secondary Colors (Emerald)
			</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-secondary-50 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-secondary-100 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-secondary-200 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-secondary-300 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-secondary-400 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-secondary-500 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-secondary-600 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-secondary-700 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-secondary-800 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-secondary-900 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					900
				</div>
			</div>
		</div>

		<!-- Tertiary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Tertiary Colors (Purple)
			</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-tertiary-50 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-tertiary-100 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-tertiary-200 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-tertiary-300 flex items-center justify-center text-xs font-medium text-contrast-900 border"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-tertiary-400 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-tertiary-500 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-tertiary-600 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-tertiary-700 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-tertiary-800 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-tertiary-900 flex items-center justify-center text-xs font-medium text-contrast-50 border"
				>
					900
				</div>
			</div>
		</div>

		<!-- Contrast Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Contrast Colors
			</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-contrast-50 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-contrast-100 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-contrast-200 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-contrast-300 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-contrast-400 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-contrast-500 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-contrast-950 flex items-center justify-center text-xs font-medium text-primary-900 border border-primary-600"
				>
					950
				</div>
			</div>
		</div>

		<!-- Interactive Elements -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold text-contrast-500">
				Interactive Elements
			</h3>
			<div class="flex flex-wrap gap-4">
				<button
					class="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-contrast-50 rounded-lg transition-colors"
				>
					Primary Button
				</button>
				<button
					class="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-contrast-50 rounded-lg transition-colors"
				>
					Secondary Button
				</button>
				<button
					class="px-6 py-3 bg-tertiary-500 hover:bg-tertiary-600 text-contrast-50 rounded-lg transition-colors"
				>
					Tertiary Button
				</button>
				<button
					class="px-6 py-3 bg-primary-700 hover:bg-primary-600 text-contrast-50 rounded-lg border border-primary-600 transition-colors"
				>
					Outline Button
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
