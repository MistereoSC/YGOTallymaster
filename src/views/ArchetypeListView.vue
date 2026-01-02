<script lang="ts" setup>
import VirtualGridCustom from '@/components/database/VirtualGridCustom.vue'
import CardPreview from '@/components/database/CardPreview.vue'
import {useArchetypes} from '@/composables/useArchetypes'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {ref, watch, onMounted} from 'vue'
import VirtualListCustom from '@/components/database/VirtualListCustom.vue'
import ArchetypeListItem from '@/components/database/ArchetypeListItem.vue'

const store = useArchetypes()
const cardPreviews = ref([] as TCardData[])

onMounted(() => {
	return
})
watch(
	() => store.initialized.value,
	(newVal) => {
		if (newVal === 'ready') {
			cardPreviews.value = store.archetypes.value.map((archetype) => {
				// Pick the first card as preview
				return archetype.preview_card
			})
		}
	},
	{immediate: true}
)
</script>

<template>
	<div class="flex flex-col gap-4 overflow-hidden h-full">
		<div
			v-if="store.initialized.value === 'ready' && cardPreviews.length > 0"
			class="h-full overflow-hidden"
		>
			<!-- <VirtualGridCustom :items="cardPreviews" :item-dimensions="{width: 236, height: 344}">
				<template #item="{item: card, index}">
					<CardPreview :card="card" size="large" />
				</template>
			</VirtualGridCustom> -->
			<VirtualListCustom :items="cardPreviews" :item-height="48" :list-gap-px="12">
				<template #item="{item: card, index}">
					<ArchetypeListItem
						:card="card"
						size="small"
						:archetype-info="{
							name: store.archetypes.value[index].name,
							cardCount: store.archetypes.value[index].cards.length,
						}"
					/>
				</template>
			</VirtualListCustom>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
