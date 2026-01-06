<script lang="ts" setup>
import {TFullSet, useCardCollections} from '@/composables/useCardCollections'
import {onBeforeUnmount, onMounted, ref} from 'vue'
import Button from '@/components/common/Button.vue'
import {Icon} from '@iconify/vue'
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from '@/components/database/CardFullView.vue'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import CardFilter from '@/components/database/CardFilter.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useCardSearch} from '@/composables/useCardSearch'
import Spinner from '@/components/common/Spinner.vue'
import SetDisplaySettings from './SetDisplaySettings.vue'

const {settings} = useDatabaseSettings()
const {resetSearch, fullCardList, searchResults, search, initialized} = useCardSearch()
const {saveSet} = useCardCollections()

const props = defineProps<{
	collectionName: string
	set: TFullSet
}>()
const emit = defineEmits<{
	(e: 'close'): void
}>()
onMounted(() => {
	if (props.set.cards.length > 0) {
		hoveredCard.value = props.set.cards[0]
	}
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
	resetSearch()
})
onBeforeUnmount(async () => {
	await saveSet(props.collectionName, props.set)
	window.removeEventListener('keydown', onKeyDown)
	window.removeEventListener('keyup', onKeyUp)
})

const hoveredCard = ref<null | TCardData>(null)
function onCardHover(card?: TCardData) {
	hoveredCard.value = card || null
}

function onCardAdd(card: TCardData) {
	if (props.set.cards.length >= 256) return
	const index = props.set.cards.findIndex((c) => c.id === card.id)
	if (index === -1) {
		props.set.cards.push(card)
	}
}
function onCardRemove(card: TCardData) {
	const index = props.set.cards.findIndex((c) => c.id === card.id)
	if (index !== -1) {
		props.set.cards.splice(index, 1)
	}
}

function onCardShiftLClick(card: TCardData) {
	activePanel.value = 'filter'
	resetSearch()
	const searchTerm = card.archetype || card.name
	search({term: searchTerm})
}

const activePanel = ref('filter' as 'filter' | 'settings' | 'none')
function toggleSettings() {
	if (activePanel.value === 'settings') activePanel.value = 'none'
	else activePanel.value = 'settings'
}
function toggleFilter() {
	if (activePanel.value === 'filter') activePanel.value = 'none'
	else activePanel.value = 'filter'
}

function onReturnClick() {
	emit('close')
}

// Scroll Side Menu for Card Preview when SHIFT key is held
const cardFullViewContainer = ref<HTMLElement | null>(null)
const isShiftHeld = ref(false)
function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'Shift') {
		isShiftHeld.value = true
	}
}
function onKeyUp(e: KeyboardEvent) {
	if (e.key === 'Shift') {
		isShiftHeld.value = false
	}
}
function onDeckAreaWheel(e: WheelEvent) {
	if (isShiftHeld.value && cardFullViewContainer.value) {
		e.preventDefault()
		cardFullViewContainer.value.scrollTop += e.deltaY
	}
}
</script>

<template>
	<div v-if="initialized === 'ready'" class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
		<div class="bg-primary-600 w-full py-1 px-1 gap-4 items-center grid grid-cols-2">
			<span class="flex gap-4 items-center">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="onReturnClick"
				/>

				<h2 class="font-bold flex gap-2 items-center">
					<div class="text-contrast-500">{{ set.name }}</div>
					<div>{{ collectionName }}</div>
				</h2>
			</span>
			<span class="flex gap-2 items-center justify-end">
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
		</div>
		<div class="grid h-full grid-cols-[auto_1fr_auto] overflow-hidden">
			<div class="min-w-86 w-[25vw] max-w-132 bg-primary-700 grid h-full overflow-hidden">
				<div class="p-2 h-full overflow-y-auto scrollable" ref="cardFullViewContainer">
					<CardFullView v-if="hoveredCard" :card="hoveredCard" />
				</div>
			</div>
			<div class="overflow-hidden h-full" @wheel="onDeckAreaWheel">
				<div
					v-if="props.set.cards.length === 0"
					class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
				>
					<Icon icon="material-symbols:credit-card-off-rounded" class="text-4xl" />
					<p class="text-lg font-medium">No cards in this Set</p>
				</div>
				<CardListVirtualList
					v-else-if="settings?.setsDisplayAsList"
					:card-list="props.set.cards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:item-size="settings?.setsGridCardSize || 'medium'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
				/>
				<CardListVirtualGrid
					v-else
					:card-list="props.set.cards"
					:gray-unowned="settings?.setsGrayUnownedGrid"
					:item-size="settings?.setsGridCardSize || 'tiny'"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					@card-Hovered="onCardHover"
					@card-shift-clicked="(card) => onCardShiftLClick(card)"
					@card-right-clicked="(card) => onCardRemove(card)"
				/>
			</div>
			<div
				class="max-w-180 w-[30vw] bg-primary-700 h-full overflow-hidden"
				v-if="activePanel !== 'none'"
			>
				<div
					v-if="activePanel === 'filter'"
					class="h-full grid grid-rows-[auto_auto] overflow-hidden"
				>
					<div class="overflow-y-scroll scrollable border-b-2 border-b-primary-400 p-2">
						<CardFilter :search-while-typing="true" />
					</div>
					<div class="h-full overflow-hidden">
						<CardListVirtualList
							:card-list="searchResults == null ? fullCardList : searchResults"
							:show-limited-info="settings?.setsListSize === 'tiny'"
							:show-owned-number="true"
							:show-owned-heart="settings?.setsShowOwnedHeartList"
							:gray-unowned="settings?.setsGrayUnownedList"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@card-hovered="(card) => onCardHover(card)"
							@card-clicked="(card) => onCardAdd(card)"
							:item-size="settings?.setsListSize || 'tiny'"
						/>
					</div>
				</div>
				<div
					v-else-if="activePanel === 'settings'"
					class="h-full grid grid-rows-2 overflow-hidden p-2"
				>
					<SetDisplaySettings />
				</div>
			</div>
		</div>
	</div>
	<div v-else class="w-full h-full grid place-items-center">
		<Spinner />
	</div>
</template>

<style lang="scss" scoped></style>
