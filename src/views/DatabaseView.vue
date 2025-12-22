<script lang="ts" setup>
import {onMounted, ref, watch, nextTick} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {getCardList} from '@/libs/CardData'
import CardFullView from '@/components/database/CardFullView.vue'
import {Icon} from '@iconify/vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import CardFilter from '@/components/database/CardFilter.vue'

import {useCardSearch} from '@/composables/useCardSearch'
const {searchResults} = useCardSearch()

const cardList = ref([] as TCardData[])
const cardGrid = ref<InstanceType<typeof CardListVirtualGrid> | null>(null)

onMounted(async () => {
	cardList.value = await getCardList()
})

// Watch for changes in search results and scroll to top
watch(
	searchResults,
	async () => {
		await nextTick()
		if (cardGrid.value) {
			cardGrid.value.scrollToTop()
		}
	},
	{deep: true}
)

const activeCard = ref<TCardData | null>(null)
function onCardClick(card: TCardData) {
	if (activeCard.value && activeCard.value.id === card.id) {
		activeCard.value = null
	} else {
		activeCard.value = card
	}
}
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<div class="w-full flex pl-8 py-1 bg-primary-600">
			{{ cardList.length }} Cards Total |
			{{
				searchResults.length > 0
					? searchResults.length + ' Search Results'
					: 'No Active Search'
			}}
			<!-- {{ visibleCards.length }} Rendered | Starting at #{{
				visibleRange.startIndex + 1
			}}
			| -->
		</div>
		<!-- <span></span> -->
		<div class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden">
			<CardListVirtualGrid
				ref="cardGrid"
				:cardList="searchResults.length > 0 ? searchResults : cardList"
				@card-clicked="(card) => onCardClick(card)"
			/>

			<div
				class="min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div
					class="w-full min-h-12 bg-primary-900 flex items-center p-2"
				>
					<span v-if="activeCard" class="flex justify-between w-full">
						<button
							class="rounded-full bg-accent-500 p-1 cursor-pointer hover:bg-accent-400"
							@click="activeCard = null"
						>
							<Icon
								icon="material-symbols:arrow-menu-open-rounded"
								class="text-2xl"
							/>
						</button>
						<span> </span>
					</span>
				</div>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView v-if="activeCard" :card="activeCard" />
					<CardFilter :search-while-typing="true" v-else />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
