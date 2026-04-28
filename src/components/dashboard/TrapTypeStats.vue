<script lang="ts" setup>
import {getTotalTrapTypeBreakdown} from '@/composables/useDashboardData'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'
import AttributeIcon from '../database/AttributeIcon.vue'

const trapTypes = ref<{type: string; count: number}[]>([])

const trapMaxCount = ref(1)

const trapTotalCount = ref(1)

onMounted(() => {
	trapTypes.value = getTotalTrapTypeBreakdown()
	trapMaxCount.value = trapTypes.value.reduce((m, e) => Math.max(m, e.count), 1)
	trapTotalCount.value = trapTypes.value.reduce((t, e) => t + e.count, 0)
})
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-tertiary-400/15">
			<Icon icon="tabler:sparkles-2" class="text-tertiary-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">Trap Cards</p>
	</div>
	<div class="flex flex-col gap-2">
		<div v-for="trap in trapTypes" :key="trap.type" class="flex gap-1 items-end w-full">
			<AttributeIcon :attribute="trap.type" size="tiny" :hideTooltip="true" />
			<ProgressBar
				:key="trap.type"
				:title="trap.type"
				:value="trap.count"
				:total="trapMaxCount"
				color-class="bg-tertiary-500"
				:show-percentage="true"
				:show-value="true"
				:real-percentage-total="trapTotalCount"
				class="w-full"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
