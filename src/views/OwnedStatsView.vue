<script lang="ts" setup>
import Spinner from '@/components/common/Spinner.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useOwnedCards} from '@/composables/useOwnedCards'
import {computed} from 'vue'
import {Icon} from '@iconify/vue'
import CoreStats from '@/components/dashboard/CoreStats.vue'
import ReleaseYearStats from '@/components/dashboard/ReleaseYearStats.vue'
import MonsterTypeStats from '@/components/dashboard/MonsterTypeStats.vue'
import TopArchetypeStats from '@/components/dashboard/TopArchetypeStats.vue'
import MonsterAttributeStats from '@/components/dashboard/MonsterAttributeStats.vue'
import MonsterRaceRanking from '@/components/dashboard/MonsterRaceRanking.vue'
import PricedPossessionStats from '@/components/dashboard/PricedPossessionStats.vue'
import CardHoarderStats from '@/components/dashboard/CardHoarderStats.vue'
import BanlistStats from '@/components/dashboard/BanlistStats.vue'
import PriceDistributionStats from '@/components/dashboard/PriceDistributionStats.vue'
import MonsterSubtypeStats from '@/components/dashboard/MonsterSubtypeStats.vue'
import SpellTypeStats from '@/components/dashboard/SpellTypeStats.vue'
import TrapTypeStats from '@/components/dashboard/TrapTypeStats.vue'

const {initialized: settingsInitialized, settings} = useDatabaseSettings()
const {initialized: ownedCardsInitialized} = useOwnedCards()

const ready = computed(
	() => ownedCardsInitialized.value === 'ready' && settingsInitialized.value === 'ready'
)
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<!-- Header -->
		<div
			class="h-12 flex items-center justify-between pl-4 pr-2 py-1 w-full bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<div class="flex gap-3 items-center">
				<Icon icon="material-symbols:bar-chart-rounded" class="text-accent-400 text-xl" />
				<div class="flex flex-col">
					<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
						Owned Card Statistics
					</h2>
				</div>
			</div>
		</div>

		<!-- Loading -->
		<div v-if="!ready" class="w-full h-full flex flex-col justify-center items-center">
			<Spinner />
		</div>

		<!-- Dashboard -->
		<div v-else class="h-full w-full overflow-y-auto scrollable p-4">
			<div class="max-w-5xl mx-auto flex flex-col gap-4">
				<!-- Row 1: Core Data -->
				<CoreStats />

				<!-- Row 2: Release Year -->
				<div class="grid grid-cols-4 gap-4">
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-4"
					>
						<ReleaseYearStats />
					</div>
				</div>

				<!-- Row 3: Archetype Ranking and Monster Type Breakdown -->
				<div class="grid grid-cols-8 gap-4">
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-5"
					>
						<TopArchetypeStats />
					</div>

					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-3"
					>
						<MonsterTypeStats />
					</div>
				</div>

				<!-- Row 4: Showcase -->
				<div class="grid grid-cols-8 gap-4">
					<div
						class="p-4 pb-0 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-4"
					>
						<CardHoarderStats />
					</div>
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-2"
					>
						<MonsterSubtypeStats />
					</div>
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-2"
					>
						<BanlistStats />
					</div>
				</div>

				<!-- Row 5: Attributes and Race Ranking -->
				<div class="grid grid-cols-8 gap-4">
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-8"
					>
						<MonsterRaceRanking />
					</div>
				</div>

				<!-- Row 6: Banlist Status + Spell/Trap Types -->
				<div class="grid grid-cols-3 gap-4">
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-1"
					>
						<MonsterAttributeStats />
					</div>
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-1"
					>
						<SpellTypeStats />
					</div>
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-1"
					>
						<TrapTypeStats />
					</div>
				</div>

				<!-- Row 7: Price Distribution + Monster Subtypes -->
				<div
					class="grid grid-cols-8 gap-4"
					v-if="settings?.cardPricesVendor && settings.cardPricesVendor !== 'none'"
				>
					<div
						class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-4"
					>
						<PriceDistributionStats />
					</div>
					<div
						class="p-4 pb-0 bg-primary-700 border border-primary-600 rounded-xl flex flex-col gap-3 col-span-4"
					>
						<PricedPossessionStats />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
