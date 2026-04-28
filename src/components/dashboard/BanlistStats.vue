<script lang="ts" setup>
import {getTotalBanlistBreakdown, getTotalOwned} from '@/composables/useDashboardData'
import {ref, onMounted, watch} from 'vue'
import {Icon} from '@iconify/vue'
import type {TBanlistFormat} from '@/libs/interfaces/YGOProInterfaces'
import ProgressBar from './ProgressBar.vue'

type TFormat = TBanlistFormat
const activeFormat = ref<TFormat>('ban_tcg')

const FORMATS: {key: TFormat; label: string}[] = [
	{key: 'ban_tcg', label: 'TCG'},
	{key: 'ban_ocg', label: 'OCG'},
	{key: 'ban_goat', label: 'GOAT'},
]

onMounted(() => {
	updateValues()
})
function updateValues() {
	const t = getTotalBanlistBreakdown(activeFormat.value)
	breakdown.value = t
	// maximum.value = Math.max(t.forbidden, t.limited, t.semiLimited, 1)
	maximum.value = t.forbidden + t.limited + t.semiLimited || 1
	totalOwned.value = getTotalOwned()
}
const breakdown = ref({forbidden: 0, limited: 0, semiLimited: 0})
const maximum = ref(1)
const totalOwned = ref(1)

watch(
	() => activeFormat.value,
	() => {
		updateValues()
	}
)
</script>

<template>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex gap-3 items-center">
			<div class="grid place-items-center w-9 h-9 rounded-lg bg-red-500/15 shrink-0">
				<Icon icon="material-symbols:block-outline" class="text-red-400 text-xl" />
			</div>
			<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
				Banlist Status
			</p>
		</div>
	</div>

	<!-- Format switcher -->
	<div class="flex justify-center">
		<div class="flex rounded-lg overflow-hidden border border-primary-600">
			<button
				v-for="f in FORMATS"
				:key="f.key"
				class="px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
				:class="
					activeFormat === f.key
						? 'bg-accent-600 text-contrast-800'
						: 'bg-primary-700 text-contrast-500 hover:bg-primary-600'
				"
				@click="activeFormat = f.key"
			>
				{{ f.label }}
			</button>
		</div>
	</div>

	<!-- Stats -->
	<div class="flex flex-col gap-3 mt-1">
		<!-- Forbidden -->
		<ProgressBar
			title="Forbidden"
			:value="breakdown.forbidden"
			:total="maximum"
			color-class="bg-red-500"
			:show-percentage="true"
			:show-value="true"
			:show-pip="true"
			:real-percentage-total="totalOwned"
		/>

		<!-- Limited -->
		<ProgressBar
			title="Limited"
			:value="breakdown.limited"
			:total="maximum"
			color-class="bg-orange-400"
			:show-percentage="true"
			:show-value="true"
			:show-pip="true"
			:real-percentage-total="totalOwned"
		/>

		<!-- Semi-Limited -->
		<ProgressBar
			title="Semi-Limited"
			:value="breakdown.semiLimited"
			:total="maximum"
			color-class="bg-yellow-400"
			:show-percentage="true"
			:show-value="true"
			:show-pip="true"
			:real-percentage-total="totalOwned"
		/>
	</div>
</template>

<style scoped></style>
