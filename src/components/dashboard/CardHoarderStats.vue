<script lang="ts" setup>
import {getMostOwnedCards} from '@/composables/useDashboardData'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import {onMounted, ref} from 'vue'
import CardPreview from '../database/CardPreview.vue'

const cards = ref<[TCardData, number][]>([])
onMounted(() => {
	cards.value = getMostOwnedCards(3)
})
</script>

<template>
	<!-- Header -->
	<div class="flex gap-3 items-center">
		<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-yellow-400/15">
			<Icon icon="material-symbols:trophy-rounded" class="text-yellow-400 text-xl" />
		</div>
		<div class="flex flex-col gap-1">
			<span
				class="text-sm font-semibold text-contrast-500 uppercase tracking-wider leading-none"
			>
				Card Hoarder
			</span>
			<span class="text-contrast-400 text-sm font-semibold leading-none"
				>Your most owned cards</span
			>
		</div>
	</div>

	<!-- Podium -->
	<div v-if="cards.length" class="flex gap-4 items-end justify-center pt-3">
		<!-- ── 2nd place ─────────────────────────────────── -->
		<div v-if="cards[1]" class="flex flex-col items-center gap-1 w-fit">
			<div class="relative">
				<!-- Rank badge -->
				<div
					class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-gray-400 border border-gray-300 flex items-center justify-center shadow-sm"
				>
					<span class="text-[10px] font-bold text-gray-900 leading-none">2</span>
				</div>
				<!-- Card wrapper -->
				<div class="ring-1 ring-gray-400/50 rounded-sm" v-tooltip.top="cards[1][0].name">
					<CardPreview
						:card="cards[1][0]"
						size="small"
						show-banlist-for="none"
						:no-hover="true"
					/>
				</div>
				<!-- Count overlay -->
				<div class="absolute left-0 right-0 bottom-1.5 grid place-items-center">
					<div class="bg-black/55 rounded px-1.5 pb-0.5">
						<span class="text-gray-300 font-bold text-lg leading-none"
							>{{ cards[1][1] }}x</span
						>
					</div>
				</div>
			</div>

			<!-- Platform block -->
			<div
				class="w-full h-8 bg-gray-500/15 border-t border-gray-500/30 rounded-t-sm flex items-center justify-center"
			>
				<span class="text-gray-400 text-[10px] font-semibold tracking-[0.15em] uppercase"
					>2nd</span
				>
			</div>
		</div>

		<!-- ── 1st place ─────────────────────────────────── -->
		<div v-if="cards[0]" class="flex flex-col items-center gap-1 w-fit">
			<div class="relative">
				<!-- Rank badge -->
				<div
					class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-yellow-400 border border-yellow-300 flex items-center justify-center shadow-sm"
				>
					<span class="text-[10px] font-bold text-yellow-900 leading-none">1</span>
				</div>
				<!-- Card wrapper with golden glow -->
				<div
					class="ring-2 ring-yellow-400/60 rounded-sm shadow-[0_0_16px_rgba(250,204,21,0.25)]"
					v-tooltip.top="cards[0][0].name"
				>
					<CardPreview
						:card="cards[0][0]"
						size="small"
						show-banlist-for="none"
						:no-hover="true"
					/>
				</div>
				<!-- Count overlay -->
				<div class="absolute left-0 right-0 bottom-1.5 grid place-items-center">
					<div class="bg-black/55 rounded px-1.5 pb-0.5">
						<span class="text-yellow-300 font-bold text-lg leading-none"
							>{{ cards[0][1] }}x</span
						>
					</div>
				</div>
			</div>

			<!-- Platform block (tallest) -->
			<div
				class="w-full h-14 bg-yellow-400/10 border-t border-yellow-400/40 rounded-t-sm flex items-center justify-center"
			>
				<span class="text-yellow-400 text-[10px] font-semibold tracking-[0.15em] uppercase"
					>1st</span
				>
			</div>
		</div>

		<!-- ── 3rd place ─────────────────────────────────── -->
		<div v-if="cards[2]" class="flex flex-col items-center gap-1 w-fit">
			<div class="relative">
				<!-- Rank badge -->
				<div
					class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-amber-700 border border-amber-600 flex items-center justify-center shadow-sm"
				>
					<span class="text-[10px] font-bold text-amber-100 leading-none">3</span>
				</div>
				<!-- Card wrapper -->
				<div class="ring-1 ring-amber-700/50 rounded-sm" v-tooltip.top="cards[2][0].name">
					<CardPreview
						:card="cards[2][0]"
						size="small"
						show-banlist-for="none"
						:no-hover="true"
					/>
				</div>
				<!-- Count overlay -->
				<div class="absolute left-0 right-0 bottom-1.5 grid place-items-center">
					<div class="bg-black/55 rounded px-1.5 pb-0.5">
						<span class="text-amber-500 font-bold text-lg leading-none"
							>{{ cards[2][1] }}x</span
						>
					</div>
				</div>
			</div>

			<!-- Platform block (shortest) -->
			<div
				class="w-full h-4 bg-amber-700/15 border-t border-amber-700/30 rounded-t-sm flex items-center justify-center"
			>
				<span class="text-amber-600 text-[10px] font-semibold tracking-[0.15em] uppercase"
					>3rd</span
				>
			</div>
		</div>
	</div>

	<!-- Empty state -->
	<div v-else class="flex flex-col items-center justify-center my-auto pb-8 gap-2">
		<Icon
			icon="material-symbols:trophy-outline-rounded"
			class="text-4xl text-contrast-300/30"
		/>
		<span class="text-contrast-400 text-xs"
			>Mark your first cards as owned to see the results.</span
		>
	</div>
</template>

<style lang="scss" scoped></style>
