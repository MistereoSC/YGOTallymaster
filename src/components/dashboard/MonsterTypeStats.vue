<script lang="ts" setup>
import {getTotalMonsterTypeBreakdown, getTotalPendulumCount} from '@/composables/useDashboardData'
import {onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'
import {Icon} from '@iconify/vue'

const monsterTypeBreakdown = ref<[string, number][]>([])
const maxCount = ref(1)
const totalCount = ref(1)
const pendulumCount = ref(0)

onMounted(() => {
	monsterTypeBreakdown.value = getTotalMonsterTypeBreakdown()
	maxCount.value = monsterTypeBreakdown.value.reduce((m, e) => Math.max(m, e[1]), 1)
	totalCount.value = monsterTypeBreakdown.value.reduce((sum, e) => sum + e[1], 0)
	pendulumCount.value = getTotalPendulumCount()
})

const frameTypeColor: Record<string, string> = {
	Normal: 'bg-card-normal',
	Effect: 'bg-card-effect',
	Ritual: 'bg-card-ritual',
	Fusion: 'bg-card-fusion',
	Synchro: 'bg-card-synchro',
	Xyz: 'bg-card-xyz',
	Link: 'bg-card-link',
	Spell: 'bg-card-spell',
	Trap: 'bg-card-trap',
}
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-accent-400/15">
			<Icon icon="material-symbols:swords-rounded" class="text-accent-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
			Monster Cards
		</p>
	</div>

	<div class="flex flex-col gap-2">
		<ProgressBar
			v-for="[type, count] in monsterTypeBreakdown"
			:key="type"
			:title="type"
			:value="count"
			:total="maxCount"
			:color-class="frameTypeColor[type] ?? 'bg-accent-500'"
			:show-percentage="true"
			:show-value="true"
			:show-pip="true"
			:real-percentage-total="totalCount"
		/>

		<ProgressBar
			title="Pendulum"
			:value="pendulumCount"
			:total="maxCount"
			:color-class="frameTypeColor['Spell'] ?? 'bg-accent-500'"
			:show-percentage="true"
			:show-value="true"
			:show-pip="true"
			:real-percentage-total="totalCount"
		/>
		<p v-if="monsterTypeBreakdown.length === 0" class="text-contrast-400 text-xs">
			No monster cards owned.
		</p>
	</div>
</template>

<style lang="scss" scoped></style>
