<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {getCardList} from '@/libs/CardData'
import CardFullView from '@/components/database/CardFullView.vue'
import {Icon} from '@iconify/vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'

const cardList = ref([] as TCardData[])
onMounted(async () => {
	cardList.value = await getCardList()
})

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
		<!-- <div class="w-full flex pl-8 py-1 bg-primary-600">
			{{ cardList.length }} Cards Total |
			{{ visibleCards.length }} Rendered | Starting at #{{
				visibleRange.startIndex + 1
			}}
			|
			{{ activeCard ? activeCard.name : 'No Active Card' }}
		</div> -->
		<span></span>
		<div class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden">
			<CardListVirtualGrid
				:cardList="cardList"
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
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
