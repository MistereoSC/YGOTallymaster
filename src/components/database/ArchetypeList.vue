<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {ref, computed, onBeforeMount, watch} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from './CardFullView.vue'
import CardListVirtualGrid from './CardListVirtualGrid.vue'
import CardListVirtualList from './CardListVirtualList.vue'
import CardFilter from './CardFilter.vue'
import {useCardSearch, _sort} from '@/composables/useCardSearch'

interface IProps {
	cardList: TCardData[]
	title: string
}
const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
	(e: 'close'): void
}>()
const {settings} = useDatabaseSettings()
const activeCard = ref(props.cardList[0] as TCardData | null)

type TSidePanel = 'filter' | 'card'
const activePanel = ref<TSidePanel>('card')

function toggleFilter() {
	activePanel.value = activePanel.value === 'filter' ? 'card' : 'filter'
}

const {searchResults, resetSearch, sortedBy} = useCardSearch()
onBeforeMount(() => {
	resetSearch()
})

const sortTrigger = ref(0)
watch(sortedBy, () => {
	sortTrigger.value++
})
const filteredCardList = computed(() => {
	sortTrigger.value

	let result: TCardData[]

	if (searchResults.value === null) {
		result = [...props.cardList]
	} else {
		const cardMap = new Map(props.cardList.map((card) => [card.id, card]))
		result = searchResults.value
			.filter((card) => cardMap.has(card.id))
			.map((card) => cardMap.get(card.id)!)
	}

	return _sort(sortedBy.value, result)
})
</script>

<template>
	<div class="grid grid-rows-[auto_1fr] overflow-hidden h-full">
		<div
			class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<div class="flex items-center gap-4">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="emit('close')"
					v-tooltip.bottom="'Return'"
				/>
				<div class="flex gap-3 items-center">
					<div class="flex flex-col">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
							{{ props.title }}
						</h2>
						<p class="text-xs text-contrast-500">
							<span v-if="searchResults !== null" class="text-accent-400 font-medium">
								{{ filteredCardList.length }}
							</span>
							<span v-if="searchResults !== null"> of </span>
							<span class="font-medium">{{ props.cardList.length }}</span>
							cards
						</p>
					</div>
				</div>
			</div>
			<Button
				rounded
				size="small"
				icon="material-symbols:filter-alt"
				@click="toggleFilter"
				:class="activePanel === 'filter' ? 'ring-2 ring-accent-500/50' : ''"
				v-tooltip.bottom="'Card Search'"
			/>
		</div>

		<div class="h-full overflow-hidden grid grid-cols-[1fr_auto]">
			<div class="h-full overflow-hidden">
				<CardListVirtualList
					v-if="settings?.displayAsList"
					:cardList="filteredCardList"
					@card-clicked="(card) => (activeCard = card)"
					:active-card-id="activeCard ? activeCard.id : null"
					:item-size="settings?.listSize || 'medium'"
					:show-owned-heart="true"
					:gray-unowned="settings?.grayUnowned"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:show-card-context-menu="true"
				/>
				<CardListVirtualGrid
					v-else
					:cardList="filteredCardList"
					@card-clicked="(card) => (activeCard = card)"
					:active-card-id="activeCard ? activeCard.id : null"
					:item-size="settings?.gridSize || 'medium'"
					:show-owned-heart="true"
					:gray-unowned="settings?.grayUnowned"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:show-card-context-menu="true"
					:show-md-rarity="settings?.displayMDRarity"
				/>
			</div>
			<div
				class="border-l border-primary-600 min-w-116 w-[33vw] max-w-150 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFilter
						v-if="activePanel === 'filter'"
						:search-while-typing="true"
						:show-info-panel="true"
						:show-staples-toggle="settings?.showStaplesSlider"
					/>
					<CardFullView
						v-else-if="activeCard"
						:card="activeCard"
						:description-highlighting="settings?.descriptionHighlighting"
						:show-banlist-for="settings?.showBanlistFor || 'none'"
						:show-card-prices="settings?.cardPricesVendor !== 'none'"
						:show-release-info="settings?.showDescriptionReleases"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
