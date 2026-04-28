<script lang="ts" setup>
import {getTotalAttributeBreakdown, getTotalCardTypeBreakdown} from '@/composables/useDashboardData'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'
import AttributeIcon from '../database/AttributeIcon.vue'
import ProgressBar from './ProgressBar.vue'

const attributeBreakdown = ref<[string, number][]>([])
const maxCount = ref(1)
const totalCount = ref(1)
onMounted(() => {
	attributeBreakdown.value = getTotalAttributeBreakdown()
	const t = getTotalCardTypeBreakdown()
	maxCount.value = attributeBreakdown.value.reduce((m, e) => Math.max(m, e[1]), 1)
	totalCount.value = t.monster
})

const attributeColor: Record<string, string> = {
	LIGHT: 'bg-yellow-300',
	DARK: 'bg-purple-400',
	FIRE: 'bg-red-400',
	WATER: 'bg-blue-400',
	WIND: 'bg-green-400',
	EARTH: 'bg-gray-900',
	DIVINE: 'bg-yellow-500',
}
</script>

<template>
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-accent-400/15">
			<Icon icon="material-symbols:bolt" class="text-accent-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">Attributes</p>
	</div>

	<div>
		<div class="flex flex-col gap-2">
			<div
				v-for="[attr, count] in attributeBreakdown"
				:key="attr"
				class="flex gap-1 items-end w-full"
			>
				<AttributeIcon :attribute="attr" size="tiny" :hideTooltip="true" />
				<ProgressBar
					:key="attr"
					:title="attr"
					:value="count"
					:total="maxCount"
					:color-class="attributeColor[attr] ?? 'bg-primary-500'"
					:show-percentage="true"
					:show-value="true"
					:real-percentage-total="totalCount"
					class="w-full"
				/>
			</div>
		</div>

		<p v-if="attributeBreakdown.length === 0" class="col-span-2 text-contrast-400 text-xs">
			No monster cards owned.
		</p>
	</div>
</template>

<style lang="scss" scoped></style>
