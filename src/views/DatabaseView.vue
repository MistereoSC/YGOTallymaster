<script lang="ts" setup>
import {onMounted, ref, watch, nextTick} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from '@/components/database/CardFullView.vue'
import {Icon} from '@iconify/vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import CardFilter from '@/components/database/CardFilter.vue'

import {useCardSearch} from '@/composables/useCardSearch'
const {searchResults, fullCardList, omittedResults} = useCardSearch()

const cardGrid = ref<InstanceType<typeof CardListVirtualGrid> | null>(null)

onMounted(async () => {})

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

type TSidePanel = 'filter' | 'settings' | 'none' | 'card' | 'other'
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
		previousPanel.value =
			activePanel.value === 'none' ? 'other' : activePanel.value
		activeCard.value = card
		activePanel.value = 'card'
		return
	}
	if (activeCard.value && activeCard.value.id === card.id) {
		// Deselect card
		activeCard.value = null
		activePanel.value =
			previousPanel.value === 'none' ? 'other' : previousPanel.value
		return
	}
	activeCard.value = card
}
function toggleFilter() {
	if (activePanel.value === 'filter') {
		if (activeCard.value) {
			activePanel.value = 'card'
		} else {
			activePanel.value = 'other'
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
			activePanel.value = 'other'
		}
		previousPanel.value = 'settings'
		return
	}
	activePanel.value = 'settings'
}
function closePanel() {
	activePanel.value = 'none'
	activeCard.value = null
	previousPanel.value = 'other'
}
</script>

<template>
	<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
		<div class="w-full grid grid-cols-[1fr_auto] bg-primary-600">
			<div class="flex gap-4 items-center px-4 py-2 text-sm font-bold">
				<span>
					Showing
					<span v-if="searchResults !== null">
						{{ searchResults.length }} /
					</span>
					{{ fullCardList.length }} Cards
					<span v-if="omittedResults > 0" class="text-contrast-500">
						({{ omittedResults }} omitted)
					</span>
				</span>
			</div>
			<div class="min-w-116 w-[33vw] max-w-174 px-2 py-1">
				<span class="flex justify-between w-full">
					<span></span>
					<span class="flex gap-2">
						<button
							v-if="activePanel !== 'none'"
							class="rounded-full bg-accent-500 p-1 cursor-pointer hover:bg-accent-400"
							@click="closePanel"
						>
							<Icon
								icon="material-symbols:arrow-menu-open-rounded"
								class="text-xl"
							/>
						</button>
						<button
							class="rounded-full bg-accent-500 p-1 cursor-pointer hover:bg-accent-400"
							@click="toggleSettings"
						>
							<Icon
								icon="material-symbols:settings-rounded"
								class="text-xl"
							/>
						</button>
						<button
							class="rounded-full bg-accent-500 p-1 cursor-pointer hover:bg-accent-400"
							@click="toggleFilter"
						>
							<Icon
								icon="material-symbols:filter-alt"
								class="text-xl"
							/>
						</button>
					</span>
				</span>
			</div>
		</div>
		<div class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden">
			<CardListVirtualGrid
				ref="cardGrid"
				:cardList="searchResults == null ? fullCardList : searchResults"
				@card-clicked="(card) => onCardClick(card)"
				:active-card-id="activeCard ? activeCard.id : null"
			/>

			<div
				v-if="activePanel !== 'none'"
				class="min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<span></span>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView
						v-if="activeCard && activePanel === 'card'"
						:card="activeCard"
					/>
					<CardFilter
						:search-while-typing="true"
						v-else-if="activePanel === 'filter'"
					/>
					<div v-else-if="activePanel === 'settings'">
						Card Settings
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
