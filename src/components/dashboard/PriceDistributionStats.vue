<script lang="ts" setup>
import {getPriceDistribution, type TPriceBucket} from '@/composables/useDashboardData'
import {onMounted, ref, computed} from 'vue'
import {Icon} from '@iconify/vue'

const result = ref<{buckets: TPriceBucket[]; vendor: string} | null>(null)

onMounted(() => {
	result.value = getPriceDistribution()
})

const maxCount = computed(
	() => result.value?.buckets.reduce((m, b) => Math.max(m, b.count), 1) ?? 1
)
const totalCount = computed(() => result.value?.buckets.reduce((s, b) => s + b.count, 0) ?? 0)

const vendorLabel = computed(() => {
	if (result.value?.vendor === 'cardmarket_price') return 'Cardmarket'
	if (result.value?.vendor === 'tcgplayer_price') return 'TCGPlayer'
	return ''
})

// Colors per bucket from cheapest → most expensive
const bucketColors = [
	'bg-primary-500',
	'bg-secondary-600',
	'bg-accent-500',
	'bg-amber-500',
	'bg-yellow-400',
]

function pct(n: number) {
	if (totalCount.value === 0) return '0'
	return ((n / totalCount.value) * 100).toFixed(1)
}
</script>

<template>
	<!-- Header -->
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center w-9 h-9 rounded-lg bg-yellow-400/15 shrink-0">
			<Icon
				icon="material-symbols:bar-chart-4-bars-rounded"
				class="text-yellow-400 text-xl"
			/>
		</div>
		<div>
			<p
				class="text-sm font-semibold text-contrast-500 uppercase tracking-wider leading-tight"
			>
				Price Distribution
			</p>
			<p v-if="vendorLabel" class="text-xs text-contrast-400">via {{ vendorLabel }}</p>
		</div>
	</div>

	<!-- No vendor configured -->
	<div
		v-if="!result"
		class="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center"
	>
		<Icon icon="material-symbols:payments-rounded" class="text-3xl text-contrast-400" />
		<p class="text-xs text-contrast-500 max-w-40">
			Enable a price vendor in Settings to see the distribution.
		</p>
	</div>

	<!-- Bars -->
	<div v-else class="flex flex-col gap-2 my-auto">
		<div v-for="(bucket, i) in result.buckets" :key="bucket.label" class="flex flex-col gap-1">
			<div class="flex items-center justify-between text-xs">
				<span
					class="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-contrast-600"
				>
					<span class="w-2 h-2 rounded-full inline-block" :class="bucketColors[i]"></span>
					{{ bucket.label }}
				</span>
				<span class="flex items-center gap-2">
					<span>{{ bucket.count }}</span>
					<span class="text-contrast-500">{{ pct(bucket.count) }}%</span>
				</span>
			</div>
			<div class="h-2 rounded-full bg-primary-600 overflow-hidden">
				<div
					class="h-full rounded-full transition-all"
					:class="bucketColors[i]"
					:style="{width: (bucket.count / maxCount) * 100 + '%'}"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
