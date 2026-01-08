<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import Spinner from '../common/Spinner.vue'
import {dbNeedsUpdating, performDBUpdate} from '@/libs/Updater'
import {Icon} from '@iconify/vue'
import Button from '../common/Button.vue'

const props = defineProps<{
	forceReset?: boolean
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()
onMounted(async () => {
	state.value = 'checking'
	if (props.forceReset === true) {
		startSetup()
		return
	}
	const needsUpdating = await dbNeedsUpdating()
	if (needsUpdating) {
		state.value = 'updateAvailable'
	} else {
		state.value = 'done'
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
	state.value = 'updating'

	try {
		const result = await performDBUpdate((step, total, message) => {
			updateStep.value = step
			totalSteps.value = total
			currentMessage.value = message
		})

		if (result.success) {
			state.value = 'done'
			setTimeout(async () => {
				emit('close')
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

		<div v-else-if="state === 'updating'" class="text-center">
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

		<div v-else-if="state === 'updateAvailable'">
			<h3 class="text-lg font-bold">Update Available</h3>
			<p>A database update is available.</p>
			<div class="w-full flex items-center justify-center gap-4 pt-4">
				<button
					@click="startSetup"
					class="bg-accent-500 hover:bg-accent-400 p-2 rounded-md cursor-pointer transition-colors"
				>
					Update Now
				</button>
				<button
					@click="() => emit('close')"
					class="bg-accent-500 hover:bg-accent-400 p-2 rounded-md cursor-pointer transition-colors"
				>
					Update Later
				</button>
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
