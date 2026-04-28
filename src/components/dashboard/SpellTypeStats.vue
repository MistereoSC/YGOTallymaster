<script lang="ts" setup>
import {getTotalSpellTypeBreakdown} from '@/composables/useDashboardData'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'
import AttributeIcon from '../database/AttributeIcon.vue'

const spellTypes = ref<{type: string; count: number}[]>([])
const spellMaxCount = ref(1)
const spellTotalCount = ref(1)
onMounted(() => {
	spellTypes.value = getTotalSpellTypeBreakdown()
	spellMaxCount.value = spellTypes.value.reduce((m, e) => Math.max(m, e.count), 1)
	spellTotalCount.value = spellTypes.value.reduce((t, e) => t + e.count, 0)
})
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-secondary-400/15">
			<Icon icon="tabler:sparkles-filled" class="text-secondary-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">Spell Cards</p>
	</div>
	<div class="flex flex-col gap-2">
		<div v-for="spell in spellTypes" :key="spell.type" class="flex gap-1 items-end w-full">
			<AttributeIcon :attribute="spell.type" size="tiny" :hideTooltip="true" />
			<ProgressBar
				:key="spell.type"
				:title="spell.type"
				:value="spell.count"
				:total="spellMaxCount"
				color-class="bg-secondary-500"
				:show-percentage="true"
				:show-value="true"
				:real-percentage-total="spellTotalCount"
				class="w-full"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
