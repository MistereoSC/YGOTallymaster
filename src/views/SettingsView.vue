<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Checkbox from '@/components/common/Checkbox.vue'
import Spinner from '@/components/common/Spinner.vue'
import {getConfig, setConfig, type TConfig} from '@/libs/Config'
import {nextTick, onMounted, ref} from 'vue'
import Path from '@/libs/Paths'
import CheckForUpdates from '@/components/settings/CheckForUpdates.vue'

const config = ref<null | TConfig>(null)
const autoUpdateChecked = ref(false)
onMounted(async () => {
	config.value = await getConfig()
	autoUpdateChecked.value = config.value!.autoUpdate
})
// ------------------------------------------------------
// #region Display Settings
// -----------------------------------------------------

// #endregion
// ------------------------------------------------------
// #region Update Settings
// ------------------------------------------------------
const checkForUpdatesModalOpen = ref(false)
const forceReset = ref(false)

function onAutoUpdateChange() {
	if (!config.value) return
	autoUpdateChecked.value = !autoUpdateChecked.value
	config.value.autoUpdate = autoUpdateChecked.value
	setConfig(config.value)
}

async function onOpenFolder() {
	const pathResult = await Path.AppRoot()
	if (pathResult) {
		await window.electronShell.openPath(pathResult)
	}
}

function onUpdateModalClose() {
	checkForUpdatesModalOpen.value = false
	forceReset.value = false
}
function onForceReset() {
	forceReset.value = true
	nextTick(() => {
		checkForUpdatesModalOpen.value = true
	})
}

// #endregion
// ------------------------------------------------------
</script>

<template>
	<div class="relative h-full w-full overflow-x-hidden overflow-y-auto p-4 flex flex-col gap-8">
		<!-- Display Settings -->
		<!-- <div class="p-2 bg-primary-700 rounded-md">
			<h3 class="text-lg font-bold pb-2">Display Settings</h3>
		</div> -->

		<!-- Update Settings -->
		<div class="p-2 bg-primary-700 rounded-md">
			<h3 class="text-lg font-bold pb-2">Update Settings</h3>
			<div v-if="config" class="flex gap-4 flex-col">
				<div>
					<span class="block w-fit">
						<Checkbox
							@change="onAutoUpdateChange"
							:model-value="autoUpdateChecked"
							label="Check for DB Updates on Startup"
							:allow-only-check-to-toggle="true"
						/>
					</span>
					<p class="text-contrast-500">
						When enabled, the application will automatically check for updates to the
						YGOProDeck database on startup.
					</p>
				</div>
				<div class="flex items-center gap-4">
					<Button label="Check for Updates" @click="checkForUpdatesModalOpen = true" />
					<p class="text-contrast-500">
						Manually check for updates to the YGOProDeck database.
					</p>
				</div>

				<div class="flex items-center gap-4">
					<Button label="Force Reset" @click="onForceReset" />
					<p class="text-contrast-500">
						<span>
							Forces the application to reset the local database and fetch a fresh
							copy from YGOProDeck. This will also reset all Settings to their default
							values.
						</span>
						<span>
							This will NOT remove downloaded Images, or user-generated content.
						</span>
					</p>
				</div>

				<div class="flex items-center gap-4">
					<Button label="Open App Folder" @click="onOpenFolder" />
					<p class="text-contrast-500">
						<span> Opens the application folder in your file explorer. </span>
					</p>
				</div>
			</div>
			<div class="w-full h-24 flex items-center justify-center" v-else>
				<Spinner />
			</div>
		</div>
	</div>

	<!-- Modals -->
	<div
		v-if="checkForUpdatesModalOpen"
		class="absolute inset-0 bg-primary-900/95 z-200 grid place-items-center"
	>
		<div class="w-full max-w-1/2 bg-primary-800 p-4 rounded-md">
			<CheckForUpdates @close="onUpdateModalClose" :force-reset="forceReset" />
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
