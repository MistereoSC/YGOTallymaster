<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import Spinner from '../common/Spinner.vue'
import {dbNeedsUpdating, performDBUpdate} from '@/libs/Updater'
import {Icon} from '@iconify/vue'
import Button from '../common/Button.vue'
import {getSettings} from '@/composables/useDatabaseSettings'
import {invalidateUseCardSearch} from '@/composables/useCardSearch'
import {invalidateUseCardCollections} from '@/composables/useCardCollections'
import {invalidateUseOwnedCards} from '@/composables/useOwnedCards'
import {getConfig} from '@/libs/Config'

const props = defineProps<{
	forceReset?: null | 'completeReset' | 'reInit'
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()
onMounted(async () => {
	const settings = await getSettings()
	const language = settings.cardLanguage || 'en'
	console.debug('RE-INIT::Check Setup::Current Language:', language)

	state.value = 'checking'
	if (props.forceReset) {
		console.debug('RE-INIT::Check Setup::Starting Setup', props.forceReset)
		startSetup()
		return
	}
	const needsUpdating = await dbNeedsUpdating(language)
	if (needsUpdating) {
		console.debug('RE-INIT::Check Setup::Update Available')
		state.value = 'updateAvailable'
	} else {
		state.value = 'done'
		console.debug('RE-INIT::Check Setup::Update Done')
		setTimeout(async () => {
			emit('close')
		}, 1500)
	}
})
type TState = 'checking' | 'updating' | 'done' | 'updateAvailable' | 'error'
const state = ref<TState>('updateAvailable')

const updateStep = ref<number>(0)
const totalSteps = ref<number>(0)
const currentMessage = ref<string>('')

async function startSetup() {
	const settings = await getSettings()
	const language = settings.cardLanguage || 'en'

	invalidateUseCardSearch()
	invalidateUseCardCollections()
	invalidateUseOwnedCards()

	if (props.forceReset === 'completeReset') {
		console.debug('RE-INIT::Check Setup::Forcing Re-Download')
		_update()
	} else if (props.forceReset === 'reInit') {
		const cfg = await getConfig()
		if (!cfg) {
			console.error('RE-INIT::Check Setup::Error loading config')
			state.value = 'error'
			return
		}
		const needsUpdating = await dbNeedsUpdating(language)
		if (needsUpdating) {
			console.debug('RE-INIT::Check Setup::Update Available')
			_update()
		} else {
			console.debug('RE-INIT::Check Setup::Update Done')
			emit('close')
		}
	} else {
		_update()
	}

	async function _update() {
		state.value = 'updating'
		try {
			const result = await performDBUpdate((step, total, message) => {
				updateStep.value = step
				totalSteps.value = total
				currentMessage.value = message
			}, language)

			if (result.success) {
				emit('close')
			} else {
				console.error('Setup failed:', result.errors)
				state.value = 'error'
			}
		} catch (error) {
			console.error('Setup error:', error)
			state.value = 'error'
		}
	}
}
</script>

<template>
	<div class="font-semibold">
		<div
			v-if="state === 'checking'"
			class="text-xl font-bold flex items-center justify-center flex-col gap-8 min-h-32"
		>
			<Spinner />
			<span class="leading-none text-contrast-700">Checking for Updates ...</span>
		</div>

		<div v-else-if="state === 'updating'" class="flex flex-col items-center text-center">
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
						width: totalSteps > 0 ? (updateStep / totalSteps) * 100 + '%' : '0%',
					}"
				></div>
			</div>
		</div>

		<div v-else-if="state === 'updateAvailable'" class="flex flex-col items-center min-h-32">
			<Icon icon="material-symbols:browser-updated" class="text-6xl text-accent-400 mb-2" />
			<h3 class="text-xl font-bold mb-2">Update Available</h3>
			<p>A database update is available.</p>
			<div class="w-full flex items-center justify-center gap-4 pt-4">
				<Button @click="startSetup" label="Update Now" icon="material-symbols:download" />
				<Button
					@click="() => emit('close')"
					label="Update Later"
					icon="material-symbols:hourglass-top-rounded"
				/>
			</div>
		</div>

		<div v-else-if="state === 'done'" class="flex flex-col items-center min-h-32">
			<Icon icon="material-symbols:fact-check-rounded" class="text-6xl" />
			<h3 class="text-lg font-bold">We are Ready to go!</h3>
			<p>Your database is up to date.</p>
		</div>

		<div v-else class="flex flex-col items-center min-h-32">
			<Icon icon="material-symbols:error-outline" class="text-6xl text-red-500" />
			<h3 class="text-lg font-bold">Update Failed</h3>
			<p class="pb-2 text-contrast-500">An error occurred while checking for updates.</p>
			<Button label="Return" @click="() => emit('close')" />
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
