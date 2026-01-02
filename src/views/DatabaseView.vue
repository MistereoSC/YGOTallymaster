<script lang="ts" setup>
import {ref, watch, nextTick} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import CardFilter from '@/components/database/CardFilter.vue'

import {useCardSearch} from '@/composables/useCardSearch'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import DisplaySettings from '@/components/database/DisplaySettings.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import Button from '@/components/common/Button.vue'
import {Icon} from '@iconify/vue'
import Spinner from '@/components/common/Spinner.vue'
const {searchResults, fullCardList} = useCardSearch()

const cardGrid = ref<InstanceType<typeof CardListVirtualGrid> | null>(null)

// Watch for changes in search results and scroll to top
watch(searchResults, async () => {
	await nextTick()
	if (cardGrid.value) {
		cardGrid.value.scrollToTop()
	}
})

type TSidePanel = 'filter' | 'settings' | 'none' | 'card'
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
		activePanel.value = 'card'
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
		if (activeCard.value) {
			activePanel.value = 'card'
		} else {
			activePanel.value = 'none'
		}
		previousPanel.value = 'filter'
		return
	}
	activePanel.value = 'filter'
}
function toggleSettings() {
	if (activePanel.value === 'settings') {
		if (activeCard.value) {
			activePanel.value = 'card'
		} else {
			activePanel.value = 'none'
		}
		previousPanel.value = 'settings'
		return
	}
	activePanel.value = 'settings'
}
function closePanel() {
	activePanel.value = 'none'
	activeCard.value = null
	previousPanel.value = 'filter'
}
// #endregion
// ----------------------------------------------
// #region Settings
// ----------------------------------------------
const settingsStore = useDatabaseSettings()

// #endregion
// ----------------------------------------------
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<div class="w-full grid grid-cols-[1fr_auto] bg-primary-600">
			<div class="flex gap-4 items-center px-4 py-2 text-sm font-bold">
				<span>
					Displaying
					<span v-if="searchResults !== null"> {{ searchResults.length }} /</span>
					{{ fullCardList.length }} Cards
				</span>
			</div>
			<div class="min-w-116 w-[33vw] max-w-174 px-2 py-1">
				<span class="flex justify-between w-full">
					<span></span>
					<span class="flex gap-2">
						<Button
							v-if="activePanel !== 'none'"
							rounded
							size="small"
							icon="material-symbols:arrow-menu-open-rounded"
							@click="closePanel"
						/>
						<Button
							rounded
							size="small"
							icon="material-symbols:settings-rounded"
							@click="toggleSettings"
						/>
						<Button
							rounded
							size="small"
							icon="material-symbols:filter-alt"
							@click="toggleFilter"
						/>
					</span>
				</span>
			</div>
		</div>
		<div
			class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden"
			v-if="fullCardList.length > 0"
		>
			<CardListVirtualList
				v-if="settingsStore.settings.value?.displayAsList"
				ref="cardGrid"
				:cardList="searchResults == null ? fullCardList : searchResults"
				@card-clicked="(card) => onCardClick(card)"
				:active-card-id="activeCard ? activeCard.id : null"
				:item-size="settingsStore.settings.value?.listSize || 'medium'"
				:show-owned-heart="true"
				:show-owned-number="settingsStore.settings.value?.showOwnedNumbers"
				:gray-unowned="settingsStore.settings.value?.grayUnowned"
			/>
			<CardListVirtualGrid
				v-else
				ref="cardGrid"
				:cardList="searchResults == null ? fullCardList : searchResults"
				@card-clicked="(card) => onCardClick(card)"
				:active-card-id="activeCard ? activeCard.id : null"
				item-size="medium"
				:show-owned-heart="true"
				:show-owned-number="settingsStore.settings.value?.showOwnedNumbers"
				:gray-unowned="settingsStore.settings.value?.grayUnowned"
			/>

			<div
				v-if="activePanel !== 'none'"
				class="min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView v-if="activeCard && activePanel === 'card'" :card="activeCard" />
					<CardFilter :search-while-typing="true" v-else-if="activePanel === 'filter'" />

					<DisplaySettings v-else-if="activePanel === 'settings'" />
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
