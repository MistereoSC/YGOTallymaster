<script lang="ts" setup>
import {TFullSet} from '@/composables/useCardCollections'
import {onMounted} from 'vue'
import CardPreview from '../database/CardPreview.vue'

const props = defineProps<{
	set: TFullSet
}>()
const emit = defineEmits<{
	(e: 'clickSet', set: TFullSet): void
}>()
onMounted(() => {
	return
})
</script>

<template>
	<div
		class="w-43.25 h-64.5 grid place-items-center rounded-lg bg-primary-700 cursor-pointer hover:bg-primary-600"
	>
		<div v-if="set.cards.length > 0" class="relative">
			<CardPreview
				:card="set.cards[0]"
				size="medium"
				:gray-unowned="false"
				:gray-override="false"
			/>
			<div
				class="pointer-events-none absolute bottom-[50%] translate-y-[50%] left-0 w-full bg-contrast-950/50 text-contrast-900 text-sm text-center py-1 font-bold"
			>
				<div>{{ set.name }}</div>
				<div>({{ set.cards.length }})</div>
			</div>
		</div>
		<div v-else class="flex flex-col items-center font-bold">
			<span>{{ set.name }}</span>
			<span class="text-contrast-500">(No Cards)</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
