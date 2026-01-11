<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {loadImage} from '@/libs/Images'
import {Icon} from '@iconify/vue'
import {getCardStyles} from '@/libs/CardData'
import AttributeIcon from './AttributeIcon.vue'
import {useOwnedCards} from '@/composables/useOwnedCards'
import CardOwnHeart from '@/components/cards/CardOwnHeart.vue'
import CardLinkPreview from './CardLinkPreview.vue'
import CardBanIcon from '../cards/CardBanIcon.vue'

interface IProps {
	card: TCardData
	active?: boolean
	size?: 'tiny' | 'small' | 'medium' | 'large'

	showLimitedInfo?: boolean
	grayUnowned?: boolean
	grayOverride?: boolean
	showOwnedHeart?: boolean
	showOwnedNumber?: boolean
	showBanlistFor?: TBanlistFormat | 'none'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'medium',
})

const emit = defineEmits<{
	(e: 'click', value: TCardData): void
	(e: 'shiftClick', vlaue: TCardData): void
	(e: 'hoverEnter'): void
}>()
const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

const {ownedCards} = useOwnedCards()
onMounted(async () => {
	await getPreviewImage()
})

const numOwned = computed(() => {
	return ownedCards.value?.[props.card.id] ?? 0
})
async function getPreviewImage() {
	try {
		const result = await loadImage(props.card.id, 'cropped')
		if (result.success && result.localPath) {
			// Get image as data URL to avoid file:// protocol issues
			const dataUrlResult = await window.electronImage.getDataUrl(result.localPath)
			if (dataUrlResult.success && dataUrlResult.data) {
				imageUrl.value = dataUrlResult.data
				hasError.value = false
			} else {
				console.error('Failed to get data URL for:', props.card.name)
				hasError.value = true
			}
		} else {
			console.error('Failed to load image for:', props.card.name, result.error)
			hasError.value = true
		}
	} catch (error) {
		console.error('Error loading image for card:', props.card.name, error)
		hasError.value = true
	} finally {
		isLoading.value = false
	}
}
watch(
	() => props.card.id,
	(newVal, oldVal) => {
		if (newVal !== oldVal) {
			imageUrl.value = null
			isLoading.value = true
			hasError.value = false
			getPreviewImage()
		}
	}
)

function onClick(e: PointerEvent) {
	if (e.shiftKey) emit('shiftClick', props.card)
	else emit('click', props.card)
}
function onHoverEnter() {
	emit('hoverEnter')
}
const styles = getCardStyles(props.card)
</script>

<template>
	<div
		class="overflow-hidden select-none rounded-sm w-full px-1 hover:outline-2 hover:outline-accent-500 cursor-pointer cardItemContainer"
		:class="{
			'outline-secondary-500 outline-2': props.active,
		}"
		:style="{
			background: styles.vars.border2
				? `linear-gradient(180deg, ${styles.vars.border} 35%, ${styles.vars.border2} 65%)`
				: styles.vars.border,
		}"
		@click="(e) => onClick(e)"
		@mouseenter="onHoverEnter"
		:grayscale="props.grayOverride || (props.grayUnowned && numOwned === 0) ? 'true' : 'false'"
	>
		<div
			class="cardItemFrame bg-primary-900/90 hover:bg-primary-900 w-full grid grid-cols-[auto_1fr_auto] gap-2"
			:class="{
				'h-8': props.size === 'tiny',
				'h-12': props.size === 'small',
				'h-16': props.size === 'medium',
				'h-20': props.size === 'large',
			}"
		>
			<!-- Image Preview -->
			<div
				class="bg-primary-700 rounded-sm overflow-hidden relative aspect-square"
				:class="{
					'h-8': props.size === 'tiny',
					'h-12': props.size === 'small',
					'h-16': props.size === 'medium',
					'h-20': props.size === 'large',
				}"
			>
				<!-- Error state -->
				<div
					v-if="hasError"
					class="w-full h-full flex flex-col items-center justify-center p-2"
				>
					<Icon
						icon="material-symbols:imagesmode-outline"
						class="text-4xl text-red-400"
					/>
				</div>
				<!-- Loading state -->
				<div v-else-if="isLoading" class="w-full h-full flex items-center justify-center">
					<i class="animate-spin text-4xl"><Icon icon="tabler:loader-2" /></i>
				</div>
				<!-- Image loaded -->
				<div v-else class="w-full h-full relative cursor-pointer">
					<img
						:src="imageUrl!"
						:alt="card.name"
						class="w-full h-full object-cover object-top cardItemImage"
					/>
				</div>
			</div>

			<!-- Card Info -->
			<div class="grid grid-cols-[1fr_auto]">
				<div
					:class="{
						'grid-rows-[auto_1fr] grid': props.size !== 'tiny',
						'flex items-center gap-4': props.size === 'tiny',
					}"
				>
					<!-- Top Row -->
					<div
						class="flex gap-2 items-center justify-between"
						:class="{
							'w-full': props.size === 'tiny',
						}"
					>
						<div class="flex gap-2 items-center">
							<CardBanIcon
								:show-banlist-for="props.showBanlistFor"
								:banlist-info="props.card.banlist_info"
								:size="props.size"
							/>
							<AttributeIcon
								class="shrink-0"
								:attribute="props.card.attribute ?? props.card.race"
								:size="
									props.size === 'tiny' || props.size === 'small'
										? 'tiny'
										: 'small'
								"
							/>
							<div class="line-clamp-1">
								{{ props.card.name }}
							</div>
						</div>
						<div class="flex gap-4" v-if="!props.showLimitedInfo">
							<span class="flex items-center gap-1" v-if="card.scale">
								<div class="rotate-45 w-2 h-2 bg-blue-500"></div>
								<span class="font-bold">{{ card.scale }}</span>
								<div class="rotate-45 w-2 h-2 bg-red-500"></div>
							</span>
							<div class="h-full grid grid-cols-[72px_72px]" v-if="card.attribute">
								<span class="flex items-center gap-1">
									<Icon
										icon="material-symbols:swords-rounded"
										class="text-red-400"
									/>
									<b class="font-semibold">
										{{ card.atk! >= 0 ? card.atk : '?' }}
									</b>
								</span>
								<span v-if="card.linkval" class="flex items-center gap-1">
									<Icon
										icon="material-symbols:link-rounded"
										class="text-accent-400"
									/>

									<b class="font-semibold">
										{{ card.linkval }}
									</b>
								</span>
								<span v-else class="flex items-center gap-1">
									<Icon
										icon="material-symbols:shield-rounded"
										class="text-blue-400"
									/>
									<b class="font-semibold">
										{{ card.def! >= 0 ? card.def : '?' }}
									</b>
								</span>
							</div>
						</div>
					</div>
					<!-- Bottom Row-->
					<div
						class="flex gap-2 items-center justify-between"
						v-if="!props.showLimitedInfo"
					>
						<div class="flex gap-4" v-if="props.size !== 'tiny' && card.attribute">
							<span class="line-clamp-1"
								>[{{ props.card.typeline?.join(' / ') }}]</span
							>
						</div>
						<div>
							<div
								v-if="props.size !== 'tiny' && card.level"
								class="flex items-center gap-1"
							>
								<span class="font-semibold"> [{{ card.level }}] </span>
								<span
									v-for="n in card.level"
									:key="n"
									class="leading-none rounded-full w-4 h-4 grid place-items-center text-card-effecttext"
									:class="
										['xyz', 'xyz_pendulum'].includes(card.frameType)
											? 'bg-black'
											: 'bg-card-effect'
									"
								>
									<Icon icon="material-symbols:star-rounded" />
								</span>
							</div>
							<div v-else-if="card.level" class="flex gap-0.5 items-center">
								<span class="font-bold">{{ card.level }}</span>
								<span
									class="leading-none rounded-full w-4 h-4 grid place-items-center text-card-effecttext"
									:class="
										['xyz', 'xyz_pendulum'].includes(card.frameType)
											? 'bg-black'
											: 'bg-card-effect'
									"
								>
									<Icon icon="material-symbols:star-rounded" />
								</span>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-center">
					<CardLinkPreview
						v-if="!props.showLimitedInfo && props.card.linkmarkers"
						:links="props.card.linkmarkers"
						:size="props.size === 'tiny' ? 'tiny' : 'small'"
					/>
					<div
						v-else-if="props.showOwnedNumber && !props.showOwnedHeart && numOwned > 0"
						class="font-bold"
					>
						{{ numOwned }}
					</div>
				</div>
			</div>

			<!-- Controls -->
			<div class="flex flex-col justify-evenly items-center">
				<CardOwnHeart :card-id="props.card.id" v-if="props.showOwnedHeart" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.cardItemContainer[grayscale='true'] {
	opacity: 0.4;
	transition: opacity 0.2s;
	&:hover {
		opacity: 1;
	}

	.cardItemFrame {
		background-color: color-mix(in srgb, var(--color-primary-600) 90%, transparent);

		.cardItemImage {
			filter: grayscale(1);
			transition: filter 0.2s ease;
		}
		&:hover {
			.cardItemImage {
				filter: grayscale(0);
			}
		}
	}
}
</style>
