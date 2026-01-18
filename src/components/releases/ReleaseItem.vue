<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {TSetListData} from '@/libs/interfaces/YGOProInterfaces'
import {loadOtherImage} from '@/libs/Images'
import {Icon} from '@iconify/vue'

interface IProps {
	set: TSetListData
	size?: 'tiny' | 'small' | 'medium' | 'large'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'medium',
})

const emit = defineEmits<{
	(e: 'click', value: TSetListData): void
}>()
const imageUrl = ref<string | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

onMounted(async () => {
	await getPreviewImage()
})

async function getPreviewImage() {
	if (!props.set.set_image) {
		hasError.value = true
		isLoading.value = false
		return
	}
	try {
		const result = await loadOtherImage(props.set.set_image, 'images/sets', props.set.set_code)
		if (result.success && result.localPath) {
			// Get image as data URL to avoid file:// protocol issues
			const dataUrlResult = await window.electronImage.getDataUrl(result.localPath)
			if (dataUrlResult.success && dataUrlResult.data) {
				imageUrl.value = dataUrlResult.data
				hasError.value = false
			} else {
				console.error('Failed to get data URL for:', props.set.set_name)
				hasError.value = true
			}
		} else {
			console.error('Failed to load image for:', props.set.set_name, result.error)
			hasError.value = true
		}
	} catch (error) {
		console.error('Error loading image for card:', props.set.set_name, error)
		hasError.value = true
	} finally {
		isLoading.value = false
	}
}
watch(
	() => props.set.set_code,
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
	emit('click', props.set)
}
</script>

<template>
	<div
		class="overflow-hidden select-none rounded-sm w-full px-1 hover:outline-2 hover:outline-accent-500 cursor-pointer bg-accent-900"
		@click="onClick"
	>
		<div
			class="cardItemFrame bg-primary-900/90 hover:bg-primary-900 w-full grid grid-cols-[auto_1fr] gap-2"
			:class="{
				'h-8': props.size === 'tiny',
				'h-12': props.size === 'small',
				'h-16': props.size === 'medium',
				'h-20': props.size === 'large',
			}"
		>
			<!-- Image Preview -->
			<div
				class="rounded-sm overflow-hidden relative aspect-square"
				:class="{
					'h-8': props.size === 'tiny',
					'h-12': props.size === 'small',
					'h-16': props.size === 'medium',
					'h-20': props.size === 'large',
				}"
			>
				<!-- Error State -->
				<div
					v-if="hasError"
					class="w-full h-full flex flex-col items-center justify-center p-2 bg-primary-700"
				>
					<Icon
						icon="material-symbols:imagesmode-outline"
						class="text-4xl text-red-400"
					/>
				</div>
				<!-- Loading State -->
				<div
					v-else-if="isLoading"
					class="w-full h-full flex items-center justify-center bg-primary-700"
				>
					<i class="animate-spin text-4xl"><Icon icon="tabler:loader-2" /></i>
				</div>
				<!-- Loaded Image -->
				<div v-else class="w-full h-full relative cursor-pointer">
					<img
						:src="imageUrl!"
						:alt="props.set.set_name"
						class="w-full h-full object-contain cardItemImage"
					/>
				</div>
			</div>

			<!-- Release Info -->
			<div class="flex items-center justify-start gap-4 pl-3">
				<span class="text-lg text-accent-300 text-center w-14"
					>({{ props.set.set_code }})</span
				>
				<div>
					<div class="flex gap-4 items-center">
						<span class="text-lg font-bold">{{ props.set.set_name }}</span>
						<span class="font-semibold text-contrast-600">
							{{ props.set.num_of_cards }} Cards
						</span>
					</div>
					<span class="font-semibold text-contrast-600">
						{{ props.set.tcg_date }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
