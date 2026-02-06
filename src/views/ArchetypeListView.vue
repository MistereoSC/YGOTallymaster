<script lang="ts" setup>
import {ESortArchetypeBy, TArchetype, useArchetypes} from '@/composables/useArchetypes'
import {ref, watch, nextTick, onMounted, onBeforeUnmount} from 'vue'
import VirtualListCustom from '@/components/database/VirtualListCustom.vue'
import ArchetypeListItem from '@/components/database/ArchetypeListItem.vue'
import Spinner from '@/components/common/Spinner.vue'
import ArchetypeList from '@/components/database/ArchetypeList.vue'
import {Icon} from '@iconify/vue'

const {archetypes, initialized, sortedBy, sort} = useArchetypes()
const archetypesFiltered = ref(null as TArchetype[] | null)

const virtualListRef = ref<{
	scrollTo: (position: number) => void
	getScrollTop: () => number
} | null>(null)
const savedScrollPosition = ref(0)

const selectedArchetype = ref(null as TArchetype | null)
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
	archetypesFiltered.value = null
}

function onSearch() {
	const query = searchInput.value.trim().toLowerCase()
	if (query === '') {
		archetypesFiltered.value = null
		return
	}
	archetypesFiltered.value = []
	archetypes.value.forEach((archetype) => {
		if (archetype.name.toLowerCase().includes(query)) {
			archetypesFiltered.value!.push(archetype)
			return
		}
	})
}

watch(sortedBy, (newVal) => {
	if (archetypesFiltered.value) {
		archetypesFiltered.value = sort(newVal, archetypesFiltered.value)
	}
})

function onSelectArchetype(archetype: TArchetype) {
	if (virtualListRef.value) {
		savedScrollPosition.value = virtualListRef.value.getScrollTop()
	}
	selectedArchetype.value = archetype
}

function onArchetypeListClose() {
	selectedArchetype.value = null
	nextTick(() => {
		if (virtualListRef.value) {
			virtualListRef.value.scrollTo(savedScrollPosition.value)
		}
	})
}

watch(selectedArchetype, (newValue, oldValue) => {
	if (newValue !== null && oldValue === null) {
		history.pushState({deckOpen: true}, '')
	}
})

const handlePopState = () => {
	if (selectedArchetype.value !== null) {
		selectedArchetype.value = null
	}
}

onMounted(() => {
	window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
	window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
	<div class="flex flex-col gap-4 overflow-hidden h-full">
		<div v-if="selectedArchetype" class="overflow-hidden h-full">
			<ArchetypeList
				:card-list="selectedArchetype.cards"
				:title="selectedArchetype.name"
				@close="onArchetypeListClose"
			/>
		</div>
		<div
			v-else-if="initialized === 'ready' && archetypes.length > 0"
			class="h-full overflow-hidden grid grid-rows-[auto_1fr]"
		>
			<!-- Page Header -->
			<div
				class="h-12 w-full px-4 py-1 bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600 flex items-center justify-between shrink-0"
			>
				<div class="flex items-center gap-3 flex-1">
					<div class="flex gap-3 items-center w-24">
						<div class="flex flex-col">
							<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
								Archetypes
							</h2>
							<p class="text-xs text-contrast-500">
								<span class="font-medium">{{ archetypes.length }}</span>
								archetypes
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
							@keyup="(e) => onSearchInput(e)"
							type="text"
							placeholder="Search archetypes..."
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

					<!-- Sort Dropdown -->
					<div class="relative">
						<select
							v-model="sortedBy"
							@change="sort(sortedBy)"
							class="bg-primary-800 text-contrast-700 rounded-md px-3 py-1.5 pr-8 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors appearance-none cursor-pointer"
						>
							<option
								v-for="(label, key) in ESortArchetypeBy"
								:key="key"
								:value="label"
								class="cursor-pointer"
							>
								{{ label }}
							</option>
						</select>
						<Icon
							icon="material-symbols:arrow-drop-down-rounded"
							class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 pointer-events-none text-xl"
						/>
					</div>
				</div>
			</div>

			<VirtualListCustom
				ref="virtualListRef"
				:items="archetypesFiltered ?? archetypes"
				:item-height="48"
				:list-gap-px="12"
			>
				<template #item="{item: archetype, index}">
					<ArchetypeListItem
						:card="archetype.preview_card"
						size="small"
						:archetype-info="{
							name: (archetypesFiltered ?? archetypes)[index].name,
							cardCount: (archetypesFiltered ?? archetypes)[index].cards.length,
						}"
						@click="onSelectArchetype((archetypesFiltered ?? archetypes)[index])"
					/>
				</template>
			</VirtualListCustom>
		</div>
		<div v-else class="w-full h-full">
			<div class="w-full h-full flex flex-col justify-center items-center">
				<Spinner />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
