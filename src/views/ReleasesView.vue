<script lang="ts" setup>
import Spinner from '@/components/common/Spinner.vue'
import ArchetypeList from '@/components/database/ArchetypeList.vue'
import VirtualListCustom from '@/components/database/VirtualListCustom.vue'
import ReleaseItem from '@/components/releases/ReleaseItem.vue'
import {TCardData, TSetListData} from '@/libs/interfaces/YGOProInterfaces'
import {getCardsForRelease, getReleases} from '@/libs/Releases'
import {Icon} from '@iconify/vue'
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
		} else if (set.set_code.toLowerCase().includes(query)) {
			setsFiltered.value!.push(set)
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
					class="h-12 w-full px-4 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
				>
					<div class="flex items-center gap-3 flex-1">
						<div class="flex gap-3 items-center w-24">
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

						<!-- Search Field -->
						<div class="relative ml-4 flex-1 max-w-xs">
							<Icon
								icon="material-symbols:search-rounded"
								class="absolute left-2.5 top-1/2 -translate-y-1/2 text-contrast-500 text-lg"
							/>
							<input
								v-model="searchInput"
								type="text"
								@keyup="(e) => onSearchInput(e)"
								placeholder="Search releases..."
								class="w-full bg-primary-800 text-contrast-700 placeholder-contrast-500 rounded-md pl-9 pr-3 py-1.5 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors"
							/>
							<button
								v-if="searchInput"
								@click="onReset"
								class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
							>
								<Icon icon="material-symbols:close-rounded" class="text-lg" />
							</button>
						</div>
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
