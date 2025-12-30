<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {loadImage} from '@/libs/Images'
import {Icon} from '@iconify/vue'
import {getCardStyles} from '@/libs/CardData'
import AttributeIcon from './AttributeIcon.vue'
import {useOwnedCards} from '@/composables/useOwnedCards'
import CardOwnHeart from '@/components/cards/CardOwnHeart.vue'

interface IProps {
	card: TCardData
	active?: boolean
	size?: 'tiny' | 'small' | 'medium' | 'large'
	grayUnowned?: boolean
	showOwnedHeart?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'medium',
})

const emit = defineEmits<{
	(e: 'click', value: TCardData): void
}>()
const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

const ownedStore = useOwnedCards()
onMounted(async () => {
	await getPreviewImage()
})

const numOwned = computed(() => {
	return ownedStore.ownedCards.value?.[props.card.id] ?? 0
})
async function getPreviewImage() {
	try {
		const result = await loadImage(props.card.id, 'cropped')
		if (result.success && result.localPath) {
			// Get image as data URL to avoid file:// protocol issues
			const dataUrlResult = await window.electronImage.getDataUrl(
				result.localPath
			)
			if (dataUrlResult.success && dataUrlResult.data) {
				imageUrl.value = dataUrlResult.data
				hasError.value = false
			} else {
				console.error('Failed to get data URL for:', props.card.name)
				hasError.value = true
			}
		} else {
			console.error(
				'Failed to load image for:',
				props.card.name,
				result.error
			)
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

function onClick() {
	emit('click', props.card)
}
const styles = getCardStyles(props.card)
</script>

<template>
	<div
		class="overflow-hidden select-none rounded-sm w-full px-1 hover:outline-2 hover:outline-accent-500 cursor-pointer"
		:class="{
			'outline-secondary-500 outline-2': props.active,
		}"
		:style="{
			background: styles.vars.border2
				? `linear-gradient(180deg, ${styles.vars.border} 35%, ${styles.vars.border2} 65%)`
				: styles.vars.border,
		}"
		@click="onClick"
	>
		<div
			class="cardItemFrame bg-primary-900/90 hover:bg-primary-900 w-full grid grid-cols-[auto_1fr_auto] gap-2"
			:grayscale="props.grayUnowned && numOwned === 0 ? 'true' : 'false'"
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
				<div
					v-else-if="isLoading"
					class="w-full h-full flex items-center justify-center"
				>
					<i class="animate-spin text-4xl"
						><Icon icon="tabler:loader-2"
					/></i>
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
			<div
				class=""
				:class="{
					'grid grid-rows-[auto_1fr] py-1': props.size !== 'tiny',
					'flex items-center gap-4': props.size === 'tiny',
				}"
			>
				<div class="flex gap-2 items-center">
					<AttributeIcon
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
				<div class=""></div>
			</div>

			<!-- Controls -->
			<div class="flex flex-col justify-evenly items-center">
				<CardOwnHeart :card-id="props.card.id" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.cardItemFrame[grayscale='true'] {
	background-color: color-mix(
		in srgb,
		var(--color-primary-600) 90%,
		transparent
	);

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
</style>
