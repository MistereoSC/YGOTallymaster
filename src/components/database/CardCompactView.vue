<script lang="ts" setup>
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'
import AttributeIcon from './AttributeIcon.vue'
import CardHighlightedDescription from './CardHighlightedDescription.vue'
import CardPreview from './CardPreview.vue'

const props = defineProps<{
	card: TCardData
	descriptionHighlighting?: boolean
	linkHighlighting?: boolean
}>()
</script>

<template>
	<div class="w-full grid grid-rows-[auto_1fr] overflow-hidden h-full">
		<div>
			<!-- Name / Attribute -->
			<div
				class="font-bold px-3 py-2 bg-primary-800 w-full flex items-center justify-between"
			>
				<span class="font-semibold text-contrast-700 flex-1">{{ card.name }}</span>
			</div>

			<!-- Card Details -->
			<div class="grid grid-cols-[auto_1fr]">
				<!-- Card Image -->
				<div class="p-2">
					<CardPreview :card="card" size="small" :no-hover="true" v-if="card.id > 0" />
					<img
						alt="Card Image"
						src="/assets/cardback.webp"
						class="object-cover rounded w-29.5 h-43"
						v-else
					/>
				</div>
				<!-- Card Atk/Def/Link/Scale/Lvl -->
				<div class="p-2" v-if="card.type !== 'Token'">
					<!-- Card Typeline / Icon -->
					<div class="w-full flex items-center gap-2 text-sm font-semibold pb-3">
						<AttributeIcon :attribute="card.attribute ?? card.race" size="tiny" />
						<span v-if="card.typeline" class="text-xs text-contrast-600"
							>[ {{ card.typeline.join(' / ') }} ]</span
						>
						<span v-else>{{ card.humanReadableCardType }}</span>
					</div>
					<!-- Card Level / Rank -->
					<span class="flex items-center gap-1" v-if="card.level">
						<span
							v-for="_ in card.level"
							class="leading-none rounded-full w-3 h-3 grid place-items-center text-card-effecttext shadow-sm"
							:class="
								['xyz', 'xyz_pendulum'].includes(card.frameType)
									? 'bg-black'
									: 'bg-card-effect'
							"
						>
							<Icon icon="material-symbols:star-rounded" class="text-xs" />
						</span>
						<span class="text-contrast-500 pl-2 font-semibold">{{ card.level }}</span>
					</span>
					<!-- Stats -->
					<div
						v-if="card.frameType !== 'spell' && card.frameType !== 'trap'"
						class="font-mono"
					>
						<!-- Link Value -->
						<span v-if="card.linkval" class="flex items-center gap-1">
							<Icon icon="material-symbols:link-rounded" class="text-accent-400" />
							{{ card.linkval }}
						</span>
						<!-- Pendulum Scale -->
						<span class="flex items-center gap-2.5 pl-0.5">
							<div
								class="rotate-45 w-2.5 h-2.5 bg-linear-30 from-red-500 to-blue-500 shadow-sm shadow-red-500/50"
							></div>
							{{ card.scale }}
						</span>
						<!-- ATK -->
						<span class="flex items-center gap-2">
							<Icon icon="material-symbols:swords-rounded" class="text-red-400" />
							{{ card.atk! >= 0 ? card.atk : '?' }}
						</span>
						<!-- DEF -->
						<span v-if="!card.linkval" class="flex items-center gap-2">
							<Icon icon="material-symbols:shield-rounded" class="text-blue-400" />
							{{ card.def! >= 0 ? card.def : '?' }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Card Description -->
		<div
			class="h-full overflow-y-scroll scrollable bg-primary-800 py-3 border-t border-primary-500"
		>
			<div class="px-2">
				<CardHighlightedDescription
					v-if="props.descriptionHighlighting"
					:description="card.desc"
					:frame-type="card.frameType"
					:display-links="props.linkHighlighting"
				/>
				<span
					v-else
					class="leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm"
				>
					{{ card.desc }}
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
