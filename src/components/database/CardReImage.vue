<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {loadImage} from '@/libs/Images'
import {getCardStyles} from '@/libs/CardData'
import {Icon} from '@iconify/vue'
import CardReImageLinkmarkers from './CardReImageLinkmarkers.vue'

const props = defineProps<{
	card: TCardData
}>()
const emit = defineEmits<{
	(e: 'click', value: TCardData): void
}>()
const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
	await getPreviewImage()
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

const styles = ref(getCardStyles(props.card))
watch(
	() => props.card.id,
	(newVal, oldVal) => {
		if (newVal !== oldVal) {
			imageUrl.value = null
			isLoading.value = true
			hasError.value = false
			styles.value = getCardStyles(props.card)
			getPreviewImage()
		}
	}
)
</script>

<template>
	<div
		class="p-4 rounded-md shadow-md"
		:style="{
			background: styles.vars.border2
				? `linear-gradient(180deg, ${styles.vars.border} 35%, ${styles.vars.border2} 65%)`
				: styles.vars.border,
		}"
	>
		<div
			class="w-84 h-84 rounded-sm relative"
			:style="{
				transition: 'outline-width 0.1s ease',
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
				<div class="text-sm text-center font-semibold">
					{{ card.name }}
				</div>
				<div class="text-xs text-center">
					{{ card.id }}
				</div>
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
			<div v-else class="w-full h-full relative">
				<img
					:src="imageUrl!"
					:alt="card.name"
					class="w-full h-full object-cover object-top rounded-sm shadow-md shadow-black/50"
				/>
				<span v-if="card.linkmarkers">
					<CardReImageLinkmarkers :links="card.linkmarkers" />
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
