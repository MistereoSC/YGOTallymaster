<script lang="ts" setup>
import {ref, watch, nextTick, onBeforeMount} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import CardFilter from '@/components/database/CardFilter.vue'

import {useCardSearch} from '@/composables/useCardSearch'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'

const {settings} = useDatabaseSettings()
const {searchResults, fullCardList, resetSearch, search} = useCardSearch()

const cardGrid = ref<InstanceType<typeof CardListVirtualGrid> | null>(null)
onBeforeMount(() => {
	resetSearch()
})

// Watch for changes in search results and scroll to top
watch(searchResults, async () => {
	await nextTick()
	if (cardGrid.value) {
		cardGrid.value.scrollToTop()
	}
})

type TSidePanel = 'filter' | 'none' | 'card'
const activePanel = ref<TSidePanel>('filter')
const previousPanel = ref<TSidePanel>('filter')
const activeCard = ref<TCardData | null>(null)

// Watch for side panel changes and trigger resize
watch(activePanel, async (newVal, oldVal) => {
	if (oldVal === 'none' || newVal === 'none') {
		await nextTick()
		if (cardGrid.value) {
			cardGrid.value.handleResize()
		}
	}
})

function onCardClick(card: TCardData) {
	if (activePanel.value !== 'card') {
		previousPanel.value = activePanel.value === 'none' ? 'filter' : activePanel.value
		activeCard.value = card
		if (!settings.value?.splitDatabaseView) activePanel.value = 'card'
		return
	}
	if (activeCard.value && activeCard.value.id === card.id) {
		// Deselect card
		activeCard.value = null
		activePanel.value = previousPanel.value === 'none' ? 'filter' : previousPanel.value
		return
	}
	activeCard.value = card
}
function toggleFilter() {
	if (activePanel.value === 'filter') {
		if (settings.value?.splitDatabaseView) {
			activePanel.value = 'none'
		} else if (activeCard.value) {
			activePanel.value = 'card'
		} else {
			activePanel.value = 'none'
		}
		previousPanel.value = 'filter'
		return
	}
	activePanel.value = 'filter'
}

function onCardShiftLClick(card: TCardData) {
	resetSearch()
	const searchTerm = card.archetype || card.name
	search({term: searchTerm})
}

// #endregion
// ----------------------------------------------
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<div
			class="h-12 flex items-center justify-between pl-4 pr-2 py-1 w-full g bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<div class="flex gap-3 items-center">
				<div class="flex flex-col">
					<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
						Card Database
					</h2>
					<p class="text-xs text-contrast-500">
						<span v-if="searchResults !== null" class="text-accent-400 font-medium">
							{{ searchResults.length }}
						</span>
						<span v-if="searchResults !== null"> of </span>
						<span class="font-medium">{{ fullCardList.length }}</span>
						cards
					</p>
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

		<div
			class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden"
			:class="{'grid-cols-[auto_1fr_auto]!': settings?.splitDatabaseView}"
			v-if="fullCardList.length > 0"
		>
			<div
				v-if="settings?.splitDatabaseView"
				class="border-r border-primary-600 min-w-96 w-[25vw] max-w-116 bg-primary-700 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-scroll scrollable p-3 pr-2" v-if="activeCard">
					<CardFullView
						:card="activeCard"
						:description-highlighting="settings?.descriptionHighlighting"
						:show-banlist-for="settings?.showBanlistFor || 'none'"
						:show-card-prices="settings?.cardPricesVendor !== 'none'"
					/>
				</div>
			</div>
			<CardListVirtualList
				v-if="settings?.displayAsList"
				ref="cardGrid"
				:cardList="searchResults == null ? fullCardList : searchResults"
				@card-clicked="(card) => onCardClick(card)"
				@card-shift-clicked="(card) => onCardShiftLClick(card)"
				:active-card-id="activeCard ? activeCard.id : null"
				:item-size="settings?.listSize || 'medium'"
				:show-owned-heart="true"
				:gray-unowned="settings?.grayUnowned"
				:show-banlist-for="settings?.showBanlistFor || 'none'"
				:show-card-context-menu="true"
			/>
			<CardListVirtualGrid
				v-else
				ref="cardGrid"
				:cardList="searchResults == null ? fullCardList : searchResults"
				@card-clicked="(card) => onCardClick(card)"
				@card-shift-clicked="(card) => onCardShiftLClick(card)"
				:active-card-id="activeCard ? activeCard.id : null"
				:item-size="settings?.gridSize || 'medium'"
				:show-owned-heart="true"
				:show-owned-number="settings?.showOwnedNumbers"
				:gray-unowned="settings?.grayUnowned"
				:show-banlist-for="settings?.showBanlistFor || 'none'"
				:show-card-context-menu="true"
				:show-refresh-image-button="true"
			/>

			<div
				v-if="activePanel !== 'none'"
				class="border-l border-primary-600 min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-scroll scrollable p-3 pr-2">
					<CardFullView
						v-if="activeCard && activePanel === 'card' && !settings?.splitDatabaseView"
						:card="activeCard"
						:description-highlighting="settings?.descriptionHighlighting"
						:show-banlist-for="settings?.showBanlistFor || 'none'"
						:show-card-prices="settings?.cardPricesVendor !== 'none'"
					/>
					<CardFilter
						:search-while-typing="true"
						v-else-if="activePanel === 'filter' || settings?.splitDatabaseView"
						:show-info-panel="true"
					/>
				</div>
			</div>
		</div>
		<div v-else class="w-full h-full">
			<div class="w-full h-full flex flex-col justify-center items-center">
				<Spinner />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
