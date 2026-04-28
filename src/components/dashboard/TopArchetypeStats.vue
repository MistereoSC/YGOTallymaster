<script lang="ts" setup>
import {getTotalArchetypeRanking} from '@/composables/useDashboardData'
import {onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'
import {Icon} from '@iconify/vue'

const archetypeRanking = ref<[string, number][]>([])
const maxCount = ref(1)
onMounted(() => {
	const t = getTotalArchetypeRanking().slice(0, 16)
	archetypeRanking.value = t
	maxCount.value = t[0]?.[1] ?? 1
})
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-secondary-400/15">
			<Icon icon="material-symbols:group-work" class="text-secondary-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
			Top Archetypes
		</p>
	</div>

	<div
		class="grid grid-cols-2 gap-x-6 gap-y-2 grid-rows-8 grid-flow-col"
		v-if="archetypeRanking.length > 0"
	>
		<div
			v-for="([archetype, count], i) in archetypeRanking"
			:key="archetype"
			class="flex items-center gap-1.5"
		>
			<span class="w-[2ch] text-contrast-300 font-bold text-sm text-end">{{ i + 1 }}</span>
			<ProgressBar
				:key="archetype"
				:title="archetype"
				:value="count"
				:total="maxCount"
				color-class="bg-secondary-600"
				:show-percentage="false"
				:show-value="true"
				class="w-full"
			/>
		</div>
	</div>

	<div v-else class="flex flex-col items-center justify-center gap-2 pb-8">
		<Icon icon="material-symbols:group-work" class="text-4xl text-contrast-300/30" />
		<span class="text-contrast-400 text-xs">
			Mark your first cards as owned to see the results.
		</span>
	</div>
</template>

<style lang="scss" scoped></style>
