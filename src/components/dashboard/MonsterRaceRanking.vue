<script lang="ts" setup>
import {getTotalRaceRanking} from '@/composables/useDashboardData'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'

const raceRanking = ref<[string, number][]>([])
const maxCount = ref(1)
onMounted(() => {
	const t = getTotalRaceRanking().slice(0, 28)
	raceRanking.value = t
	maxCount.value = t[0]?.[1] ?? 1
})
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-accent-400/15">
			<Icon icon="tabler:spider-filled" class="text-accent-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
			Monster Types
		</p>
	</div>

	<div class="grid grid-cols-4 grid-rows-7 direction-auto gap-2 grid-flow-col">
		<div
			v-for="([race, count], i) in raceRanking"
			:key="race"
			class="flex items-center gap-1.5"
		>
			<span class="w-[2ch] text-contrast-300 font-bold text-sm text-end">{{ i + 1 }}</span>
			<ProgressBar
				:key="race"
				:title="race"
				:value="count"
				:total="maxCount"
				color-class="bg-accent-700"
				:show-value="true"
				:show-percentage="false"
				class="w-full"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
