<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import ArchetypeList from '@/components/database/ArchetypeList.vue'
import VirtualListCustom from '@/components/database/VirtualListCustom.vue'
import ReleaseItem from '@/components/releases/ReleaseItem.vue'
import {TCardData, TSetListData} from '@/libs/interfaces/YGOProInterfaces'
import {getCardsForRelease, getReleases} from '@/libs/Releases'
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'

const virtualListRef = ref<{
	scrollTo: (position: number) => void
	getScrollTop: () => number
} | null>(null)

const state = ref<'loading' | 'error' | 'ready'>('loading')
onMounted(async () => {
	state.value = 'loading'
	const t = await getReleases()
	if (!t) {
		state.value = 'error'
		return
	}
	sets.value = t
	state.value = 'ready'
})

const sets = ref<TSetListData[]>([])
const setsFiltered = ref<TSetListData[] | null>(null)
const selectedRelease = ref<{set: TSetListData; cards: TCardData[]} | null>(null)

const savedScrollPosition = ref(0)
async function onReleaseItemSelect(item: TSetListData) {
	if (virtualListRef.value) {
		savedScrollPosition.value = virtualListRef.value.getScrollTop()
	}
	state.value = 'loading'
	const cards = await getCardsForRelease(item.set_code)
	selectedRelease.value = {set: item, cards}
	state.value = 'ready'
}

function onReleaseItemClose() {
	selectedRelease.value = null
	nextTick(() => {
		if (virtualListRef.value) {
			virtualListRef.value.scrollTo(savedScrollPosition.value)
		}
	})
}

watch(selectedRelease, (newValue, oldValue) => {
	if (newValue !== null && oldValue === null) {
		history.pushState({deckOpen: true}, '')
	}
})

const handlePopState = () => {
	if (selectedRelease.value !== null) {
		selectedRelease.value = null
	}
}

onMounted(() => {
	window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
	window.removeEventListener('popstate', handlePopState)
})

const searchInput = ref('')

const DEBOUNCE_DELYAY = 100
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
function onSearchInput(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		onSearch()
		return
	}
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		onSearch()
	}, DEBOUNCE_DELYAY)
}
function onReset() {
	searchInput.value = ''
	setsFiltered.value = null
}

function onSearch() {
	const query = searchInput.value.trim().toLowerCase()
	if (query === '') {
		setsFiltered.value = null
		return
	}
	setsFiltered.value = []
	sets.value.forEach((set) => {
		if (set.set_name.toLowerCase().includes(query)) {
			setsFiltered.value!.push(set)
			return
		}
	})
}
</script>

<template>
	<div class="h-full overflow-hidden">
		<div class="h-full overflow-hidden">
			<div v-if="selectedRelease" class="overflow-hidden h-full">
				<ArchetypeList
					@close="onReleaseItemClose"
					:card-list="selectedRelease.cards"
					:title="`${selectedRelease.set.set_name}  (${selectedRelease.set.set_code})`"
				/>
			</div>
			<div
				v-else-if="state === 'ready'"
				class="h-full overflow-hidden grid grid-rows-[auto_1fr]"
			>
				<div
					class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
				>
					<div class="flex gap-3 items-center">
						<div class="flex flex-col">
							<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
								Releases
							</h2>
							<p class="text-xs text-contrast-500">
								<span class="font-medium">{{ sets.length }}</span>
								sets
							</p>
						</div>
					</div>

					<div class="grid grid-cols-[1fr_auto] gap-2 items-center">
						<input
							v-model="searchInput"
							@keyup="(e) => onSearchInput(e)"
							type="text"
							placeholder="Search Releases..."
							class="w-full px-2 py-1 rounded-md bg-primary-800 border border-primary-600 focus:outline-none focus:border-accent-500 placeholder:text-contrast-500"
						/>
						<Button
							v-if="searchInput.length > 0"
							rounded
							icon="material-symbols:filter-alt-off-rounded"
							@click="onReset"
							size="small"
						/>
						<span v-else class="w-7"></span>
					</div>
				</div>
				<VirtualListCustom
					ref="virtualListRef"
					:items="setsFiltered ?? sets"
					:item-height="80"
					:list-gap-px="12"
				>
					<template #item="{item: set}">
						<ReleaseItem :set="set" @click="onReleaseItemSelect(set)" size="large" />
					</template>
				</VirtualListCustom>
			</div>
			<div v-else-if="state === 'loading'" class="w-full h-full">
				<div class="w-full h-full flex flex-col justify-center items-center">
					<Spinner />
				</div>
			</div>
			<div v-else></div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
