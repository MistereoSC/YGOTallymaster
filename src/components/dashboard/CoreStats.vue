<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import ProgressBar from './ProgressBar.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import * as DBData from '@/composables/useDashboardData'
import {Icon} from '@iconify/vue'

const {settings} = useDatabaseSettings()

const totalPrice = ref(0)
const totalBreakdown = ref({monster: 0, spell: 0, trap: 0})
const uniqueOwned = ref(0)
const totalOwned = ref(0)
onMounted(() => {
	totalPrice.value = DBData.getTotalPrice() ?? 0
	totalBreakdown.value = DBData.getTotalCardTypeBreakdown()
	uniqueOwned.value = DBData.getUniqueOwned() ?? 0
	totalOwned.value = DBData.getTotalOwned() ?? 0
})

const vendorLabel = computed(() => {
	const vendor = settings.value?.cardPricesVendor
	if (vendor === 'cardmarket_price') return 'Cardmarket'
	if (vendor === 'tcgplayer_price') return 'TCGPlayer'
	return null
})

function formatPrice(val: number): string {
	return val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
}
</script>

<template>
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<!-- Total Owned -->
		<div class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col">
			<div class="flex gap-3 items-center">
				<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-accent-400/15">
					<Icon icon="material-symbols:layers-rounded" class="text-accent-400 text-xl" />
				</div>
				<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
					Total Cards
				</p>
			</div>

			<div class="my-auto flex items-center justify-center">
				<p class="flex gap-1 items-end">
					<span class="text-xl font-semibold text-contrast-800 leading-lax">{{
						totalOwned
					}}</span>
					<span class="uppercase text-sm font-semibold text-contrast-400">Cards</span>
				</p>
			</div>
		</div>

		<!-- Unique Owned -->
		<div class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col">
			<div class="flex gap-3 items-center">
				<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-secondary-400/15">
					<Icon icon="material-symbols:style" class="text-secondary-400 text-xl" />
				</div>
				<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
					Unique Cards
				</p>
			</div>

			<div class="my-auto flex items-center justify-center">
				<p class="flex gap-1 items-end">
					<span class="text-xl font-semibold text-contrast-800 leading-lax">{{
						uniqueOwned
					}}</span>
					<span class="uppercase text-sm font-semibold text-contrast-400">Cards</span>
				</p>
			</div>
		</div>

		<!-- Price tile -->
		<div class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col">
			<div class="flex gap-3 items-center">
				<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-yellow-400/15">
					<Icon
						icon="material-symbols:payments-rounded"
						class="text-yellow-400 text-xl"
					/>
				</div>
				<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
					Estimated Value
				</p>
			</div>

			<div class="my-auto flex items-center flex-col">
				<template v-if="vendorLabel && totalPrice !== null">
					<p class="text-xl font-semibold text-contrast-800 leading-lax">
						${{ formatPrice(totalPrice) }}
					</p>
					<p class="text-xs text-contrast-400">via {{ vendorLabel }}</p>
				</template>
				<template v-else>
					<p class="text-xl font-semibold leading-lax text-contrast-600">Priceless</p>
					<p class="text-xs text-contrast-400 text-center">
						Enable a price vendor in settings to see an estimated value of your
						collection.
					</p>
				</template>
			</div>
		</div>

		<div class="p-4 bg-primary-700 border border-primary-600 rounded-xl flex flex-col">
			<div class="flex gap-3 items-center">
				<div class="grid place-items-center mb-1 w-9 h-9 rounded-lg bg-accent-400/15">
					<Icon
						icon="material-symbols:category-rounded"
						class="text-accent-400 text-xl"
					/>
				</div>
				<p class="text-sm font-semibold text-contrast-500 uppercase tracking-wider">
					Card Types
				</p>
			</div>
			<div class="flex flex-col gap-2">
				<!-- Monster -->
				<ProgressBar
					title="Monster"
					:value="totalBreakdown.monster"
					:total="totalOwned"
					color-class="bg-card-effect"
				/>

				<!-- Spell -->
				<ProgressBar
					title="Spell"
					:value="totalBreakdown.spell"
					:total="totalOwned"
					color-class="bg-card-spell"
				/>

				<!-- Trap -->
				<ProgressBar
					title="Trap"
					:value="totalBreakdown.trap"
					:total="totalOwned"
					color-class="bg-card-trap"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
