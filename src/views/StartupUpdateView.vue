<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {getConfig} from '@/libs/Config'
import {dbNeedsUpdating, performDBUpdate} from '@/libs/Updater'
import {useRouter} from 'vue-router'
import ExternalLink from '@/components/common/ExternalLink.vue'

onMounted(async () => {
	await checkSetupState()
})

const router = useRouter()
type TState = 'checking' | 'needs-setup' | 'update-available' | 'ready' | 'updating' | 'error'
const state = ref<TState>('checking')

async function checkSetupState() {
	const cfg = await getConfig()
	if (cfg?.dbVer === '0') {
		state.value = 'needs-setup'
	} else if (cfg?.autoUpdate && (await dbNeedsUpdating())) {
		state.value = 'update-available'
	} else {
		state.value = 'ready'
		await router.push({name: 'Database'})
	}
}

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
		<div class="bg-black/80 absolute inset-0 flex items-center justify-center">
			<div>
				<div v-if="state === 'checking'" class="text-xl font-bold">
					<span class="leading-none">Checking for Updates ...</span>
				</div>
				<div v-else-if="state === 'needs-setup'">
					<div class="font-semibold">
						<h3 class="text-lg font-bold">Welcome to YGO Tallymaster!</h3>
						<p>Before we can get started, we need to set up your database.</p>
						<p>
							Card Data, Price Data, Images etc. will be fetched from the
							<ExternalLink url="https://db.ygoprodeck.com" message="YGOProDeck" />
							API.
						</p>
						<p>This Process should only take a few seconds.</p>
						<div class="w-full grid place-items-center pt-4">
							<button
								@click="startSetup"
								class="bg-accent-500 hover:bg-accent-400 p-2 rounded-md cursor-pointer transition-colors"
							>
								Get started!
							</button>
						</div>
					</div>
				</div>
				<div v-else-if="state === 'update-available'">
					<div class="font-semibold">
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
								@click="skipUpdate"
								class="bg-accent-500 hover:bg-accent-400 p-2 rounded-md cursor-pointer transition-colors"
							>
								Update Later
							</button>
						</div>
					</div>
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
								width:
									totalSteps > 0 ? (updateStep / totalSteps) * 100 + '%' : '0%',
							}"
						></div>
					</div>
				</div>
				<div v-else-if="state === 'ready'" class="flex flex-col items-center min-h-32">
					<Icon icon="material-symbols:fact-check-rounded" class="text-6xl" />
					<h3 class="text-lg font-bold">We are Ready to go!</h3>
					<p>Your database is up to date.</p>
				</div>
				<div v-else-if="state === 'error'" class="text-center">
					<h3 class="text-lg font-bold mb-4 text-red-500">
						An error occurred during setup.
					</h3>
					<p class="font-semibold">Please try restarting the application.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
