<script lang="ts" setup>
import {ESortArchetypeBy, TArchetype, useArchetypes} from '@/composables/useArchetypes'
import {ref, watch, nextTick} from 'vue'
import VirtualListCustom from '@/components/database/VirtualListCustom.vue'
import ArchetypeListItem from '@/components/database/ArchetypeListItem.vue'
import Spinner from '@/components/common/Spinner.vue'
import ArchetypeList from '@/components/database/ArchetypeList.vue'
import Button from '@/components/common/Button.vue'

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
</script>

<template>
	<div class="flex flex-col gap-4 overflow-hidden h-full">
		<div v-if="selectedArchetype" class="overflow-hidden h-full">
			<ArchetypeList :archetype="selectedArchetype" @close="onArchetypeListClose" />
		</div>
		<div
			v-else-if="initialized === 'ready' && archetypes.length > 0"
			class="h-full overflow-hidden grid grid-rows-[auto_1fr]"
		>
			<div class="bg-primary-600 py-1 flex justify-between items-center px-4 h-10">
				<h2 class="font-bold">{{ archetypes.length }} Archetypes</h2>
				<div class="grid grid-cols-[1fr_auto] gap-2 items-center">
					<input
						v-model="searchInput"
						@keyup="(e) => onSearchInput(e)"
						type="text"
						placeholder="Search Archetypes..."
						class="w-full px-2 py-1 rounded-md bg-primary-800 border border-primary-600 focus:outline-none focus:border-accent-500 placeholder:text-contrast-500"
					/>
					<Button
						rounded
						icon="material-symbols:filter-alt-off-rounded"
						@click="onReset"
						size="small"
					/>
				</div>
				<div>
					<div class="items-center">
						<span class="font-bold pr-2">Sort</span>
						<select
							v-model="sortedBy"
							@change="sort(sortedBy)"
							class="bg-primary-800 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500 w-46"
						>
							<option
								v-for="(label, key) in ESortArchetypeBy"
								:key="key"
								:value="label"
							>
								{{ label }}
							</option>
						</select>
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
