<script lang="ts" setup>
import {
	getTotalMonsterSubtypeBreakdown,
	getTotalCardTypeBreakdown,
} from '@/composables/useDashboardData'
import {onMounted, ref} from 'vue'
import {Icon} from '@iconify/vue'
import ProgressBar from './ProgressBar.vue'

const subtypes = ref<[string, number][]>([])
const maxCount = ref(1)
const totalMonsters = ref(1)

onMounted(() => {
	subtypes.value = getTotalMonsterSubtypeBreakdown()
	maxCount.value = subtypes.value.reduce((m, e) => Math.max(m, e[1]), 1)
	totalMonsters.value = getTotalCardTypeBreakdown().monster
})

// Icon per subtype
const subtypeIcon: Record<string, string> = {
	Tuner: 'material-symbols:settings-rounded',
	Flip: 'material-symbols:flip-rounded',
	Toon: 'material-symbols:animation',
	Spirit: 'material-symbols:local-fire-department-rounded',
	Union: 'material-symbols:link',
	Gemini: 'material-symbols:join',
}
</script>

<template>
	<!-- Header -->
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center w-9 h-9 rounded-lg bg-tertiary-500/15 shrink-0">
			<Icon icon="tabler:spiral" class="text-tertiary-400 text-xl" />
		</div>
		<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
			Monster Subtypes
		</p>
	</div>

	<div class="flex flex-col gap-2">
		<div v-for="[subtype, count] in subtypes" :key="subtype" class="flex gap-1.5 items-center">
			<Icon
				:icon="subtypeIcon[subtype] ?? 'material-symbols:star-rounded'"
				class="text-base text-tertiary-400 shrink-0"
			/>
			<ProgressBar
				:title="subtype"
				:value="count"
				:total="maxCount"
				color-class="bg-tertiary-500"
				:show-percentage="true"
				:show-value="true"
				:show-pip="false"
				:real-percentage-total="totalMonsters"
				class="flex-1"
			/>
		</div>
	</div>
</template>

<style scoped></style>
