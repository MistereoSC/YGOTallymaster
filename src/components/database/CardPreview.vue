<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {TCardData} from '../../libs/interfaces/YGOProInterfaces'
import {loadImage} from '../../libs/Images'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	card: TCardData
}>()

const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
	try {
		const result = await loadImage(props.card.id, 'small')
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
})
</script>

<template>
	<div
		class="w-43.25 h-64.5 bg-primary-700 rounded-sm overflow-hidden relative"
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
			<i class="animate-spin text-4xl"><Icon icon="tabler:loader-2" /></i>
		</div>

		<!-- Image loaded -->
		<div v-else class="w-full h-full relative">
			<img
				:src="imageUrl!"
				:alt="card.name"
				class="w-full h-full object-cover"
			/>
			<!-- Optional overlay with card name -->
			<!-- <div
				class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"
			>
				<div class="text-white text-xs font-medium">
					{{ card.name }}
				</div>
			</div> -->
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
