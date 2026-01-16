<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {getConfig} from '@/libs/Config'
import {
	appNeedsUpdating,
	dbNeedsUpdating,
	performDBUpdate,
	runVersionMigrations,
} from '@/libs/Updater'
import {useRouter} from 'vue-router'
import ExternalLink from '@/components/common/ExternalLink.vue'
import {Icon} from '@iconify/vue'
import {getSettings} from '@/composables/useDatabaseSettings'
import Spinner from '@/components/common/Spinner.vue'
import Button from '@/components/common/Button.vue'
onMounted(async () => {
	await checkSetupState()
})

const router = useRouter()
type TState = 'checking' | 'needs-setup' | 'update-available' | 'ready' | 'updating' | 'error'
const state = ref<TState>('checking')
let neededSetup = false

async function checkSetupState() {
	const cfg = await getConfig()
	if (!cfg) {
		console.error('INIT::Check Setup::Error loading config')
		neededSetup = true
		state.value = 'error'
		return
	}
	const settings = await getSettings()
	const language = settings.cardLanguage || 'en'
	console.debug('INIT::Check Setup::Current Language:', language)

	if (!cfg.dbVer[language] || cfg.dbVer[language] === '0') {
		console.debug(
			`INIT::Check Setup::Needs Setup::cfg.dbVer[${language}] `,
			cfg.dbVer[language]
		)
		neededSetup = true
		state.value = 'needs-setup'
	} else if (cfg?.autoUpdate && (await dbNeedsUpdating(language))) {
		console.debug('INIT::Check Setup::Update Available')
		state.value = 'update-available'
	} else if (await appNeedsUpdating()) {
		console.debug('INIT::Check Setup::App Update Available')
		state.value = 'updating'
		await runVersionMigrations()
		await router.push({name: 'Database'})
	} else {
		console.debug('INIT::Check Setup::Ready')
		// state.value = 'ready'
		await router.push({name: 'Database'})
	}
}

const updateStep = ref<number>(0)
const totalSteps = ref<number>(0)
const currentMessage = ref<string>('')

async function startSetup() {
	state.value = 'updating'
	const settings = await getSettings()
	const language = settings.cardLanguage || 'en'

	try {
		const result = await performDBUpdate((step, total, message) => {
			updateStep.value = step
			totalSteps.value = total
			currentMessage.value = message
		}, language)

		if (result.success) {
			state.value = 'ready'
			setTimeout(async () => {
				await router.push({name: 'Database'})
			}, 1500)
		} else {
			console.error('Setup failed:', result.errors)
			state.value = 'error'
		}
	} catch (error) {
		console.error('Setup error:', error)
		state.value = 'error'
	}
}
function skipUpdate() {
	router.push({name: 'Database'})
}
</script>

<template>
	<div class="w-full min-h-full">
		<div class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm">
			<div
				class="w-full max-w-lg bg-primary-800 p-5 rounded-xl border border-primary-600 shadow-2xl"
			>
				<div
					v-if="state === 'checking'"
					class="text-lg font-bold flex items-center justify-center flex-col gap-8 min-h-32"
				>
					<Spinner />
					<span class="leading-none text-contrast-700">Checking for Updates ...</span>
				</div>

				<div
					v-else-if="state === 'updating'"
					class="flex flex-col items-center text-center"
				>
					<div class="mt-4 mb-6">
						<Spinner />
					</div>
					<div class="mb-2">
						<div class="text-sm text-gray-300 mb-1">
							{{ currentMessage }}
						</div>
						<div class="text-lg">Step {{ updateStep }} of {{ totalSteps }}</div>
					</div>
					<div class="w-64 bg-gray-700 rounded-full h-2 mx-auto">
						<div
							class="bg-accent-500 h-2 rounded-full transition-all duration-300"
							:style="{
								width:
									totalSteps > 0 ? (updateStep / totalSteps) * 100 + '%' : '0%',
							}"
						></div>
					</div>
				</div>

				<div
					v-else-if="state === 'needs-setup'"
					class="flex flex-col items-center min-h-32"
				>
					<Icon
						icon="material-symbols:playing-cards-rounded"
						class="text-6xl text-accent-400 mb-2"
					/>
					<h3 class="text-xl font-bold mb-2">Welcome to YGO Tallymaster!</h3>

					<div class="flex flex-col gap-2">
						<p class="text-contrast-700">
							Before we can get started, we need to set up your local database.
						</p>
						<p class="text-contrast-700 text-sm">
							Card Data, Images etc. will be fetched from the
							<ExternalLink
								url="https://db.ygoprodeck.com"
								message="YGOProDeck"
								class="text-accent-400"
							/>
							API, and stored locally on your device. Images are only fetched once
							they are needed, and are then available offline.
						</p>
						<p class="text-contrast-500 text-center text-sm mb-4">
							This process should only take a few seconds.
						</p>
					</div>
					<Button
						@click="startSetup"
						label="Get Started"
						icon="material-symbols:rocket-launch-rounded"
					/>
				</div>

				<div
					v-else-if="state === 'update-available'"
					class="flex flex-col items-center min-h-32"
				>
					<Icon
						icon="material-symbols:browser-updated"
						class="text-6xl text-accent-400 mb-2"
					/>
					<h3 class="text-xl font-bold mb-2">Update Available</h3>
					<p>A database update is available.</p>
					<div class="w-full flex items-center justify-center gap-4 pt-4">
						<Button
							@click="startSetup"
							label="Update Now"
							icon="material-symbols:download"
						/>
						<Button
							@click="skipUpdate"
							label="Update Later"
							icon="material-symbols:hourglass-top-rounded"
						/>
					</div>
				</div>

				<div v-else-if="state === 'ready'" class="flex flex-col items-center min-h-32">
					<Icon icon="material-symbols:fact-check-rounded" class="text-6xl" />
					<h3 class="text-lg font-bold">We are Ready to go!</h3>
					<p>Your database is up to date.</p>
				</div>

				<div v-else class="flex flex-col items-center min-h-32">
					<Icon icon="material-symbols:error-outline" class="text-6xl text-red-500" />
					<h3 class="text-lg font-bold">Update Failed</h3>
					<p class="font-semibold text-contrast-700">
						An error occurred while checking for updates.
					</p>
					<p v-if="neededSetup" class="text-contrast-500">
						Please try restarting the application.
					</p>
					<div class="mt-2" v-else>
						<p class="text-contrast-500">
							It is recommended to restart the application.
						</p>
						<p class="text-contrast-500">You can also skip the update.</p>
						<div class="flex items-center justify-center gap-4 mt-6">
							<Button label="Skip Update" @click="skipUpdate" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
