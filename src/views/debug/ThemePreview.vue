<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
</script>

<template>
	<div class="p-4 min-h-screen">
		<ThemeSwitcher />

		<!-- Primary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Primary Colors</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-primary-50 flex items-center justify-center font-medium text-contrast-50 border"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-primary-100 flex items-center justify-center font-medium text-contrast-50 border"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-primary-200 flex items-center justify-center font-medium text-contrast-50 border"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-primary-300 flex items-center justify-center font-medium text-contrast-50 border"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-primary-400 flex items-center justify-center font-medium text-contrast-800 border"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-primary-500 flex items-center justify-center font-medium text-contrast-800 border"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-primary-600 flex items-center justify-center font-medium text-contrast-800 border"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-primary-700 flex items-center justify-center font-medium text-contrast-800 border"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-primary-800 flex items-center justify-center font-medium text-contrast-800 border"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-primary-900 flex items-center justify-center font-medium text-contrast-800 border"
				>
					900
				</div>
			</div>
		</div>

		<!-- Accent Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Accent Colors (Blue)</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-accent-50 flex items-center justify-center font-medium text-contrast-50"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-accent-100 flex items-center justify-center font-medium text-contrast-50"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-accent-200 flex items-center justify-center font-medium text-contrast-50"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-accent-300 flex items-center justify-center font-medium text-contrast-50"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-accent-400 flex items-center justify-center font-medium text-contrast-800"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-accent-500 flex items-center justify-center font-medium text-contrast-800"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-accent-600 flex items-center justify-center font-medium text-contrast-800"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-accent-700 flex items-center justify-center font-medium text-contrast-800"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-accent-800 flex items-center justify-center font-medium text-contrast-800"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-accent-900 flex items-center justify-center font-medium text-contrast-800"
				>
					900
				</div>
			</div>
		</div>

		<!-- Secondary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Secondary Colors (Emerald)</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-secondary-50 flex items-center justify-center font-medium text-contrast-50"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-secondary-100 flex items-center justify-center font-medium text-contrast-50"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-secondary-200 flex items-center justify-center font-medium text-contrast-50"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-secondary-300 flex items-center justify-center font-medium text-contrast-50"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-secondary-400 flex items-center justify-center font-medium text-contrast-800"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-secondary-500 flex items-center justify-center font-medium text-contrast-800"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-secondary-600 flex items-center justify-center font-medium text-contrast-800"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-secondary-700 flex items-center justify-center font-medium text-contrast-800"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-secondary-800 flex items-center justify-center font-medium text-contrast-800"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-secondary-900 flex items-center justify-center font-medium text-contrast-800"
				>
					900
				</div>
			</div>
		</div>

		<!-- Tertiary Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Tertiary Colors (Purple)</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-tertiary-50 flex items-center justify-center font-medium text-contrast-50"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-tertiary-100 flex items-center justify-center font-medium text-contrast-50"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-tertiary-200 flex items-center justify-center font-medium text-contrast-50"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-tertiary-300 flex items-center justify-center font-medium text-contrast-50"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-tertiary-400 flex items-center justify-center font-medium text-contrast-800"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-tertiary-500 flex items-center justify-center font-medium text-contrast-800"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-tertiary-600 flex items-center justify-center font-medium text-contrast-800"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-tertiary-700 flex items-center justify-center font-medium text-contrast-800"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-tertiary-800 flex items-center justify-center font-medium text-contrast-800"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-tertiary-900 flex items-center justify-center font-medium text-contrast-800"
				>
					900
				</div>
			</div>
		</div>

		<!-- Contrast Colors (Text) -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Contrast Colors</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 bg-contrast-50 flex items-center justify-center font-medium text-contrast-800"
				>
					50
				</div>
				<div
					class="h-16 w-16 bg-contrast-100 flex items-center justify-center font-medium text-contrast-800"
				>
					100
				</div>
				<div
					class="h-16 w-16 bg-contrast-200 flex items-center justify-center font-medium text-contrast-800"
				>
					200
				</div>
				<div
					class="h-16 w-16 bg-contrast-300 flex items-center justify-center font-medium text-contrast-800"
				>
					300
				</div>
				<div
					class="h-16 w-16 bg-contrast-400 flex items-center justify-center font-medium text-contrast-50"
				>
					400
				</div>
				<div
					class="h-16 w-16 bg-contrast-500 flex items-center justify-center font-medium text-contrast-50"
				>
					500
				</div>
				<div
					class="h-16 w-16 bg-contrast-600 flex items-center justify-center font-medium text-contrast-50"
				>
					600
				</div>
				<div
					class="h-16 w-16 bg-contrast-700 flex items-center justify-center font-medium text-contrast-50"
				>
					700
				</div>
				<div
					class="h-16 w-16 bg-contrast-800 flex items-center justify-center font-medium text-contrast-50"
				>
					800
				</div>
				<div
					class="h-16 w-16 bg-contrast-900 flex items-center justify-center font-medium text-contrast-950"
				>
					900
				</div>
				<div
					class="h-16 w-16 bg-contrast-950 flex items-center justify-center font-medium text-contrast-900"
				>
					950
				</div>
			</div>
		</div>

		<!-- Card Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Card Colors</h3>
			<div class="flex flex-wrap gap-2">
				<div
					class="h-16 w-16 text-contrast-800 bg-card-spell flex items-center justify-center font-medium"
				>
					Spell
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-spelltext flex items-center justify-center font-medium"
				>
					Spell
				</div>
				<div
					class="h-16 w-16 text-contrast-900 bg-card-trap flex items-center justify-center font-medium"
				>
					Trap
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-traptext flex items-center justify-center font-medium"
				>
					Trap
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-normal flex items-center justify-center font-medium"
				>
					Normal
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-normaltext flex items-center justify-center font-medium"
				>
					Normal
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-effect flex items-center justify-center font-medium"
				>
					Effect
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-effecttext flex items-center justify-center font-medium"
				>
					Effect
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-ritual flex items-center justify-center font-medium"
				>
					Ritual
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-ritualtext flex items-center justify-center font-medium"
				>
					Ritual
				</div>

				<div
					class="h-16 w-16 text-contrast-800 bg-card-fusion flex items-center justify-center font-medium"
				>
					Fusion
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-fusiontext flex items-center justify-center font-medium"
				>
					Fusion
				</div>

				<div
					class="h-16 w-16 text-contrast-950 bg-card-synchro flex items-center justify-center font-medium"
				>
					Synchro
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-synchrotext flex items-center justify-center font-medium"
				>
					Synchro
				</div>

				<div
					class="h-16 w-16 text-contrast-900 bg-card-xyz flex items-center justify-center font-medium"
				>
					xyz
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-xyztext flex items-center justify-center font-medium"
				>
					xyz
				</div>

				<div
					class="h-16 w-16 text-contrast-900 bg-card-link flex items-center justify-center font-medium"
				>
					Link
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-linktext flex items-center justify-center font-medium"
				>
					Link
				</div>

				<div
					class="h-16 w-16 text-contrast-800 bg-card-token flex items-center justify-center font-medium"
				>
					Token
				</div>
				<div
					class="h-16 w-16 text-contrast-950 bg-card-tokentext flex items-center justify-center font-medium"
				>
					Token
				</div>

				<div
					class="h-16 w-16 text-contrast-800 bg-card-skill flex items-center justify-center font-medium"
				>
					Skill
				</div>
				<div
					class="h-16 w-16 text-contrast-800 bg-card-skilltext flex items-center justify-center font-medium"
				>
					Skill
				</div>
			</div>
		</div>

		<!-- Card Colors -->
		<div class="mt-8">
			<h3 class="mb-4 text-xl font-bold">Components</h3>
			<div class="flex items-center gap-2">
				<Button
					size="small"
					icon="material-symbols:add-box-rounded"
					label="SM"
				/>
				<Button
					size="medium"
					icon="material-symbols:add-box-rounded"
					label="MD"
				/>
				<Button
					size="large"
					icon="material-symbols:add-box-rounded"
					label="LG"
				/>

				<Button
					size="small"
					icon="material-symbols:add-box-rounded"
					rounded
				/>
				<Button
					size="medium"
					icon="material-symbols:add-box-rounded"
					rounded
				/>
				<Button
					size="large"
					icon="material-symbols:add-box-rounded"
					rounded
				/>
			</div>
			<div class="flex flex-wrap gap-2"></div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
