<script lang="ts" setup>
import {getTotalTCGReleaseYearBreakdown} from '@/composables/useDashboardData'
import {computed, onMounted, ref} from 'vue'
import {Icon} from '@iconify/vue'

const yearBreakdown = ref<{year: string; count: number}[]>([])
onMounted(() => {
	yearBreakdown.value = getTotalTCGReleaseYearBreakdown()
})

const maxCount = computed(() => yearBreakdown.value.reduce((m, e) => Math.max(m, e.count), 1))

const numericYears = computed(() => yearBreakdown.value.filter((e) => e.year !== 'Unreleased'))
const unreleasedEntry = computed(() => yearBreakdown.value.find((e) => e.year === 'Unreleased'))

// Show label every 5 years plus the last numeric year
function showLabel(year: string, index: number, arr: {year: string}[]): boolean {
	const num = Number(year)
	return num % 5 === 2 || index === arr.length - 1
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<!-- Title -->
		<div class="flex items-center justify-between">
			<div class="flex gap-3 items-center">
				<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-tertiary-400/15">
					<Icon
						icon="material-symbols:calendar-month-rounded"
						class="text-tertiary-400 text-xl"
					/>
				</div>
				<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
					By Release Year
				</p>
			</div>

			<!-- Legend -->
			<div class="flex items-center gap-3 text-xs text-contrast-400">
				<span class="flex items-center gap-1">
					<span class="inline-block w-2.5 h-2.5 rounded-sm bg-accent-500/70"></span>
					Released
				</span>
				<span
					v-if="unreleasedEntry && unreleasedEntry.count > 0"
					class="flex items-center gap-1"
				>
					<span class="inline-block w-2.5 h-2.5 rounded-sm bg-tertiary-500/70"></span>
					Unreleased
				</span>
			</div>
		</div>

		<!-- Chart (fixed height, no scroll) -->
		<div
			class="relative"
			style="height: 220px; padding-bottom: 28px"
			v-if="numericYears.length > 0 || unreleasedEntry"
		>
			<div class="absolute inset-x-0 top-0 flex items-end gap-px" style="bottom: 28px">
				<!-- Released year bars -->
				<div
					v-for="(entry, i) in numericYears"
					:key="entry.year"
					class="relative flex-1 flex flex-col items-center justify-end h-full group min-w-0"
				>
					<!-- Bar -->
					<div
						class="w-full rounded-t-sm bg-accent-500/60 group-hover:bg-accent-400 transition-colors cursor-default"
						:style="{
							height: (entry.count / maxCount) * 100 + '%',
							minHeight: entry.count > 0 ? '2px' : '0',
						}"
					/>
					<!-- Tooltip -->
					<div
						class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<div
							class="bg-primary-600 border border-primary-500 rounded-md px-2 py-1 text-xs text-contrast-700 whitespace-nowrap shadow-lg"
						>
							<span class="font-semibold">{{ entry.year }}</span>
							<span class="text-contrast-400 ml-1"
								>— {{ entry.count.toLocaleString() }} cards</span
							>
						</div>
					</div>
					<!-- X-axis label (sparse) -->
					<p
						v-if="showLabel(entry.year, i, numericYears)"
						class="absolute top-full mt-1 text-[9px] text-contrast-400 leading-none whitespace-nowrap"
					>
						{{ entry.year }}
					</p>
				</div>

				<!-- Unreleased bar -->
				<div
					v-if="unreleasedEntry && unreleasedEntry.count > 0"
					class="relative flex-1 flex flex-col items-center justify-end h-full group min-w-0"
					style="max-width: 32px"
				>
					<div
						class="w-full rounded-t-sm bg-tertiary-500/60 group-hover:bg-tertiary-400 transition-colors cursor-default"
						:style="{
							height: (unreleasedEntry.count / maxCount) * 100 + '%',
							minHeight: unreleasedEntry.count > 0 ? '2px' : '0',
						}"
					/>
					<!-- Tooltip -->
					<div
						class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<div
							class="bg-primary-600 border border-primary-500 rounded-md px-2 py-1 text-xs text-contrast-700 whitespace-nowrap shadow-lg"
						>
							<span class="font-semibold">Unreleased</span>
							<span class="text-contrast-400 ml-1"
								>— {{ unreleasedEntry.count.toLocaleString() }} cards</span
							>
						</div>
					</div>
					<p
						class="absolute top-full mt-1 text-[9px] text-contrast-400 leading-none whitespace-nowrap"
					>
						N/A
					</p>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else>
			<div class="flex flex-col items-center justify-center gap-2 text-center px-4 pb-6">
				<Icon
					icon="material-symbols:calendar-month-rounded"
					class="text-4xl text-contrast-300/30"
				/>
				<p class="text-xs text-contrast-400">
					Mark your first cards as owned to see the results.
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
