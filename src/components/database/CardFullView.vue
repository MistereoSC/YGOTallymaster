<script lang="ts" setup>
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardReImage from './CardReImage.vue'
import {Icon} from '@iconify/vue'
import AttributeIcon from './AttributeIcon.vue'
import CardBanIcon from '@/components/cards/CardBanIcon.vue'
import CardHighlightedDescription from './CardHighlightedDescription.vue'
import {computed} from 'vue'

const props = defineProps<{
	card: TCardData
	showBanlistFor?: TBanlistFormat | 'none'
	descriptionHighlighting?: boolean
	linkHighlighting?: boolean
	showCardPrices?: boolean
	showReleaseInfo?: boolean
}>()

const emit = defineEmits<{
	(e: 'linkClick', text: string): void
}>()

const filteredSets = computed(() => {
	if(!props.card.card_sets) return null
	const seen = new Set<string>()
	return props.card.card_sets.filter((set) => {
		const code = set.set_code
		if (seen.has(code)) return false
		seen.add(code)
		return true
	})
})
</script>

<template>
	<div class="max-w-2xl mx-auto flex flex-col gap-3">
		<!-- Card Image & Name Section -->
		<div class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600">
			<!-- Card Image with gradient background -->
			<div
				class="relative flex justify-center w-full p-4 bg-linear-to-b from-primary-600/30 to-transparent"
			>
				<CardReImage
					:card="card"
					size="cropped"
					:no-hover="true"
					class="shadow-lg shadow-black/50"
				/>
			</div>

			<!-- Card Name & Attribute Bar -->
			<div class="px-2 pb-4">
				<div class="flex items-center gap-2">
					<span class="shrink-0">
						<CardBanIcon
							:show-banlist-for="props.showBanlistFor"
							:banlist-info="card.banlist_info"
							size="small"
							:show-tooltip="true"
						/>
					</span>
					<span class="text-xl font-bold text-contrast-700 flex-1">{{ card.name }}</span>
					<span class="shrink-0 w-8 h-8 flex items-center justify-center">
						<AttributeIcon :attribute="card.attribute ?? card.race" />
					</span>
				</div>

				<!-- Level/Rank Stars -->
				<div
					v-if="card.level"
					class="flex items-center gap-1.5 mt-3 px-1"
					:class="
						['xyz', 'xyz_pendulum'].includes(card.frameType) ? '' : 'flex-row-reverse'
					"
				>
					<span v-for="n in card.level" :key="n">
						<span
							class="leading-none rounded-full w-5 h-5 grid place-items-center text-card-effecttext shadow-sm"
							:class="
								['xyz', 'xyz_pendulum'].includes(card.frameType)
									? 'bg-black'
									: 'bg-card-effect'
							"
						>
							<Icon icon="material-symbols:star-rounded" class="text-sm" />
						</span>
					</span>
					<span class="font-semibold text-sm text-contrast-400 ml-1"
						>{{ ['xyz', 'xyz_pendulum'].includes(card.frameType) ? 'Rank' : 'Level' }}
						{{ card.level }}</span
					>
				</div>
			</div>
		</div>

		<!-- Stats Section (for monsters) -->
		<div
			v-if="card.attribute"
			class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600"
		>
			<div class="grid grid-cols-[auto_1fr_auto]">
				<!-- Left Pendulum Scale -->
				<div class="min-h-12">
					<div
						v-if="card.scale != undefined"
						class="flex flex-col h-full items-center gap-1 px-4 py-3 bg-linear-to-b from-blue-500/20 to-transparent border-r border-primary-600"
					>
						<div
							class="rotate-45 w-3 h-3 bg-blue-500 shadow-sm shadow-blue-500/50"
						></div>
						<span class="font-bold text-blue-400">{{ card.scale }}</span>
					</div>
				</div>

				<!-- Type & Stats -->
				<div class="flex flex-col justify-center items-center gap-2 py-3">
					<div v-if="card.typeline">
						<span
							class="text-sm font-semibold text-contrast-500 px-3 py-1 bg-primary-700 rounded-full"
							>{{ card.typeline.join(' / ') }}</span
						>
					</div>
					<div class="flex flex-row gap-6 font-bold text-contrast-600">
						<span class="flex items-center gap-1">
							<Icon icon="material-symbols:swords-rounded" class="text-red-400" />
							{{ card.atk! >= 0 ? card.atk : '?' }}
						</span>
						<span v-if="card.linkval" class="flex items-center gap-1">
							<Icon icon="material-symbols:link-rounded" class="text-accent-400" />
							{{ card.linkval }}
						</span>
						<span v-else class="flex items-center gap-1">
							<Icon icon="material-symbols:shield-rounded" class="text-blue-400" />
							{{ card.def! >= 0 ? card.def : '?' }}
						</span>
					</div>
				</div>

				<!-- Right Pendulum Scale -->
				<div>
					<div
						v-if="card.scale != undefined"
						class="flex flex-col h-full items-center gap-1 px-4 py-3 bg-linear-to-b from-red-500/20 to-transparent border-l border-primary-600"
					>
						<div class="rotate-45 w-3 h-3 bg-red-500 shadow-sm shadow-red-500/50"></div>
						<span class="font-bold text-red-400">{{ card.scale }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Card Description Section -->
		<div class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600">
			<div class="px-4 py-2 bg-primary-700/50 border-b border-primary-600">
				<span class="text-xs font-semibold text-contrast-400 uppercase tracking-wider"
					>Effect</span
				>
			</div>
			<div class="p-4">
				<CardHighlightedDescription
					v-if="props.descriptionHighlighting"
					:description="card.desc"
					:frame-type="card.frameType"
					:display-links="props.linkHighlighting"
					@link-click="(v) => emit('linkClick', v)"
				/>
				<span
					v-else
					class="leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm"
				>
					{{ card.desc }}
				</span>
			</div>
		</div>

		<!-- Releases -->
		<div class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600" v-if="props.showReleaseInfo">
			<div class="px-4 py-2 bg-primary-700/50 border-b border-primary-600">
				<span class="text-xs font-semibold text-contrast-400 uppercase tracking-wider"
					>Releases</span
				>
			</div>
			<div class="py-4">
				<span
					class="leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm flex gap-2 px-4"
				>
					<div class="flex gap-2">
						<span class="font-bold w-9">TCG:</span>
						<span class="text-accent-200">
							{{ card.misc_info[0].tcg_date || 'Unreleased' }}
						</span>
					</div>
					<div></div>
					<div class="flex gap-2">
						<span class="font-bold w-9">OCG:</span>
						<span class="text-accent-200">{{
							card.misc_info[0].ocg_date || 'Unreleased'
						}}</span>
					</div>
				</span>

				<div class="w-full h-px bg-gray-500 my-2" v-if="filteredSets"></div>
				<div class="px-4" v-if="filteredSets">
					<span
						v-for="set in filteredSets"
						class="leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm flex gap-2"
					>
						<span class="flex items-center font-mono">
							<p class="text-accent-300 text-base">
								{{ set.set_code.split('-')[0] }}
							</p>
							<p class="text-xs text-gray-500">
								-xx{{ set.set_code.split('-')[1].slice(2) }}
							</p>
						</span>
						<span>
							<span>{{ set.set_name }}</span>
							<!-- <span class="text-xs pl-1 text-gray-500">{{
								set.set_rarity_code
							}}</span> -->
						</span>
					</span>
				</div>
			</div>
		</div>

		<!-- Card Price -->
		<div
			class="rounded-lg bg-primary-800 overflow-hidden border border-primary-600"
			v-if="props.showCardPrices"
		>
			<div class="px-4 py-2 bg-primary-700/50 border-b border-primary-600">
				<span class="text-xs font-semibold text-contrast-400 uppercase tracking-wider"
					>Card Price</span
				>
			</div>
			<div class="p-4">
				<span
					v-if="card.misc_info[0].tcg_date"
					class="leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm flex gap-2"
				>
					<div class="flex">
						<span class="font-bold pr-2">Cardmarket:</span>
						<span class="text-accent-200">
							{{ card.card_prices[0].cardmarket_price || 'Unknown' }} </span
						>$
					</div>
					<div></div>
					<div class="flex">
						<span class="font-bold pr-2">TCGPlayer:</span>
						<span class="text-accent-200">
							{{ card.card_prices[0].tcgplayer_price || 'Unknown' }} </span
						>$
					</div>
				</span>
				<span v-else class="text-contrast-300 text-sm">
					Prices unavailable for unreleased cards.
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
