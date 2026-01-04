<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {loadImage} from '@/libs/Images'
import {Icon} from '@iconify/vue'
import CardOwnHeart from '@/components/cards/CardOwnHeart.vue'
import {useOwnedCards} from '@/composables/useOwnedCards'
import CardBanIcon from '@/components/cards/CardBanIcon.vue'

interface IProps {
	card: TCardData
	size?: 'small' | 'medium' | 'large' | 'tiny'
	active?: boolean
	grayUnowned?: boolean
	grayOverride?: boolean

	showOwnedHeart?: boolean
	showOwnedNumber?: boolean
	showBanlistFor?: TBanlistFormat | 'none'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'small',
	grayUnowned: false,
	showOwnedHeart: false,
	active: false,
	showOwnedNumber: false,
})
const emit = defineEmits<{
	(e: 'click', value: TCardData): void
	(e: 'shiftClick', value: TCardData): void
}>()
const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const {ownedCards} = useOwnedCards()

const numOwned = computed(() => {
	return ownedCards.value?.[props.card.id] ?? 0
})

onMounted(async () => {
	await getPreviewImage()
})
async function getPreviewImage() {
	try {
		const result = await loadImage(props.card.id, props.size === 'large' ? 'normal' : 'small')
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
	if(e.shiftKey) emit('shiftClick', props.card)
	else emit('click', props.card)
}
</script>

<template>
	<div
		class="cardItemFrame bg-primary-700 rounded-sm overflow-hidden relative outline-0 outline-accent-500 hover:outline-4"
		:class="{
			'w-21.75 h-32': props.size === 'tiny',
			'w-29.5 h-43': props.size === 'small',
			'w-43.25 h-64.5': props.size === 'medium',
			'w-59 h-86': props.size === 'large',
			'outline-4 outline-secondary-500': props.active,
		}"
		:style="{
			transition: 'outline-width 0.1s ease-out, outline-color 0.1s ease-out',
		}"
		:grayscale="props.grayOverride || (props.grayUnowned && numOwned === 0 ? 'true' : 'false')"
		@click="(e) => onClick(e)"
	>
		<!-- Error state -->
		<div v-if="hasError" class="w-full h-full flex flex-col items-center justify-center p-2">
			<Icon icon="material-symbols:imagesmode-outline" class="text-4xl text-red-400" />
			<div class="text-sm text-center font-semibold">
				{{ card.name }}
			</div>
			<div class="text-xs text-center">
				{{ card.id }}
			</div>
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
				class="w-full h-full object-cover cardItemImage"
			/>

			<!-- Optional overlay with card name -->
		</div>

		<div class="absolute bottom-1 right-1" v-if="showOwnedHeart">
			<CardOwnHeart
				:card-id="props.card.id"
				class="opacity-0 transition-opacity duration-300"
			/>
		</div>
		<div
			v-if="showOwnedNumber && numOwned > 0"
			class="absolute bottom-0 left-0 w-12 h-12 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.8),transparent_70%)]"
		>
			<div class="text-contrast-900 text-md font-bold absolute bottom-0.5 left-1.5">
				{{ numOwned }}
			</div>
		</div>
		<div class="absolute left-2 top-2">
			<CardBanIcon
				:show-banlist-for="props.showBanlistFor"
				:banlist-info="props.card.banlist_info"
				:size="props.size"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.cardItemFrame[grayscale='true'] {
	.cardItemImage {
		filter: grayscale(1);
		transition: filter 0.3s ease;
	}
	&:hover {
		.cardItemImage {
			filter: grayscale(0);
		}
	}
}
.cardItemFrame:hover {
	.cardOwnHeart {
		opacity: 1;
	}
}
</style>
