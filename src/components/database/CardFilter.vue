<script lang="ts" setup>
// -----------------------------------------
// #region Imports, Emits, Props
// -----------------------------------------
import {computed, onMounted, ref, watch, type Ref} from 'vue'
import {
	type TSearchQuery,
	type TCoreCardType,
	ESortBy,
	useCardSearch,
} from '@/composables/useCardSearch'
import ToggleButton from '@/components/common/ToggleButton.vue'
import {
	EMonsterAttributes,
	EMonsterRace,
	EMonsterType,
	ESpellTypes,
	ETrapTypes,
	TLinkMarkers,
	TMonsterAttribute,
	TMonsterRace,
	TMonsterType,
	TSpellTypes,
	TTrapTypes,
} from '@/libs/interfaces/YGOProInterfaces'
import AttributeIcon from './AttributeIcon.vue'
import Button from '@/components/common/Button.vue'
import {Icon} from '@iconify/vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import NumberInputMinMax from '@/components/common/NumberInputMinMax.vue'
import CardLinkSelection from './CardLinkSelection.vue'
import Checkbox from '@/components/common/Checkbox.vue'
import FilterSection from './FilterSection.vue'
import ToggleButtonGroup from '@/components/common/ToggleButtonGroup.vue'
import SetFilterSelector from './SetFilterSelector.vue'

const props = defineProps<{
	searchWhileTyping?: boolean
	showSetFilter?: boolean
	showInfoPanel?: boolean
}>()
// #endregion
// -----------------------------------------
// #region Search
// -----------------------------------------

const {search, resetSearch, activeQuery, sortedBy, sort} = useCardSearch()
const searchInput = ref(activeQuery.value.term || '')

// Flag to track self-initiated changes to activeQuery
let isUpdatingFromSelf = false

function onSearch() {
	isUpdatingFromSelf = true
	search(query.value)
	Promise.resolve().then(() => {
		isUpdatingFromSelf = false
	})
}

function onReset(fullReset = true) {
	// Reset all toggle arrays
	attributes.reset()
	monsterTypes.reset()
	monsterRaces.reset()
	spellTypes.reset()
	trapTypes.reset()
	levels.reset()
	scales.reset()
	linkvals.reset()
	linkMarkers.reset()
	atkFilter.value = [null, null]
	defFilter.value = [null, null]

	if (fullReset) {
		searchInput.value = ''
		toggledStaple.value = false
		toggledCoreType.value = null
		setFilter.value = null
		resetSearch()
	}

	if (toggledOwned.value) {
		onSearch()
	}
}

const DEBOUNCE_DELAY = 100
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
function onSearchInput(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		onSearch()
		return
	}
	if (!props.searchWhileTyping) return
	if (debounceTimeout) clearTimeout(debounceTimeout)
	debounceTimeout = setTimeout(() => {
		onSearch()
	}, DEBOUNCE_DELAY)
}

// #endregion
// -----------------------------------------
// #region Toggle Array Helper
// -----------------------------------------

function useToggleArray<T>(defaultOperand: 'AND' | 'OR' = 'AND') {
	const items = ref<T[]>([]) as Ref<T[]>
	const operand = ref<'AND' | 'OR'>(defaultOperand)

	const toggle = (item: T) => {
		const idx = items.value.indexOf(item)
		if (idx === -1) items.value.push(item)
		else items.value.splice(idx, 1)
		onSearch()
	}

	const reset = () => {
		items.value = []
		operand.value = defaultOperand
	}

	const resetAndSearch = () => {
		reset()
		onSearch()
	}

	const toggleOperand = () => {
		operand.value = operand.value === 'AND' ? 'OR' : 'AND'
		if (items.value.length > 0) onSearch()
	}

	const setItems = (newItems: T[]) => {
		items.value = newItems
	}

	return {items, operand, toggle, reset, resetAndSearch, toggleOperand, setItems}
}

// #endregion
// -----------------------------------------
// #region Filter Fields
// -----------------------------------------

const attributes = useToggleArray<TMonsterAttribute>('OR')
const monsterTypes = useToggleArray<TMonsterType>('AND')
const monsterRaces = useToggleArray<TMonsterRace>('OR')
const spellTypes = useToggleArray<TSpellTypes>('OR')
const trapTypes = useToggleArray<TTrapTypes>('OR')
const levels = useToggleArray<number>('OR')
const scales = useToggleArray<number>('OR')
const linkvals = useToggleArray<number>('OR')
const linkMarkers = useToggleArray<TLinkMarkers>('AND')

const setFilter = ref<{collectionName: string; setName: string} | null>(null)
function onSetFilterChange() {
	onSearch()
}

const toggledCoreType = ref<TCoreCardType | null>(null)
function resetCoreType() {
	toggledCoreType.value = null
	onSearch()
}
function toggleCoreType(type: TCoreCardType) {
	if (toggledCoreType.value === type) {
		toggledCoreType.value = null
	} else {
		toggledCoreType.value = type
	}
	onReset(false) // preserveSetFilter = true
	onSearch()
}

const atkFilter = ref<[number | null, number | null]>([null, null])
const defFilter = ref<[number | null, number | null]>([null, null])
function resetAtkDefFilters() {
	atkFilter.value = [null, null]
	defFilter.value = [null, null]
}

const toggledOwned = ref(false)
function toggleOwned() {
	toggledOwned.value = !toggledOwned.value
	onSearch()
}
const toggledStaple = ref(false)
function toggleStaple() {
	toggledStaple.value = !toggledStaple.value
	onSearch()
}

// #endregion
// -----------------------------------------
// #region Setup & Sync
// -----------------------------------------

onMounted(() => {
	_applyActiveQuery()
})

watch(
	activeQuery,
	() => {
		if (!isUpdatingFromSelf) {
			_applyActiveQuery()
		}
	},
	{deep: true}
)

function _applyActiveQuery() {
	searchInput.value = activeQuery.value.term || ''
	toggledOwned.value = activeQuery.value.owned || false
	toggledStaple.value = activeQuery.value.staple || false
	toggledCoreType.value = activeQuery.value.coreCardType || null

	attributes.setItems(activeQuery.value.attributes || [])
	monsterRaces.setItems(activeQuery.value.monsterRaces || [])
	spellTypes.setItems(activeQuery.value.spellTypes || [])
	trapTypes.setItems(activeQuery.value.trapTypes || [])
	levels.setItems(activeQuery.value.levels || [])
	scales.setItems(activeQuery.value.scales || [])
	linkvals.setItems(activeQuery.value.linkvals || [])

	if (activeQuery.value.monsterTypes) {
		monsterTypes.setItems(activeQuery.value.monsterTypes.terms)
		monsterTypes.operand.value = activeQuery.value.monsterTypes.operand
	} else {
		monsterTypes.reset()
	}

	if (activeQuery.value.links) {
		linkMarkers.setItems(activeQuery.value.links.terms)
		linkMarkers.operand.value = activeQuery.value.links.operand
	} else {
		linkMarkers.reset()
	}

	atkFilter.value = [activeQuery.value.atk?.lte ?? null, activeQuery.value.atk?.gte ?? null]
	defFilter.value = [activeQuery.value.def?.lte ?? null, activeQuery.value.def?.gte ?? null]
	setFilter.value = activeQuery.value.setFilter ?? null
}

const query = computed<TSearchQuery>(() => ({
	term: searchInput.value,
	owned: toggledOwned.value,
	staple: toggledStaple.value,
	setFilter: setFilter.value ?? undefined,
	attributes: attributes.items.value,
	coreCardType: toggledCoreType.value ?? undefined,
	monsterRaces: monsterRaces.items.value.length > 0 ? monsterRaces.items.value : undefined,
	monsterTypes:
		monsterTypes.items.value.length > 0
			? {terms: monsterTypes.items.value, operand: monsterTypes.operand.value}
			: undefined,
	spellTypes: spellTypes.items.value.length > 0 ? spellTypes.items.value : undefined,
	trapTypes: trapTypes.items.value.length > 0 ? trapTypes.items.value : undefined,
	levels: levels.items.value.length > 0 ? levels.items.value : undefined,
	scales: scales.items.value.length > 0 ? scales.items.value : undefined,
	linkvals: linkvals.items.value.length > 0 ? linkvals.items.value : undefined,
	links:
		linkMarkers.items.value.length > 0
			? {terms: linkMarkers.items.value, operand: linkMarkers.operand.value}
			: undefined,
	atk: {lte: atkFilter.value[0], gte: atkFilter.value[1]},
	def: {lte: defFilter.value[0], gte: defFilter.value[1]},
}))

const selectedSort = ref<ESortBy>(sortedBy.value ?? ESortBy.Name_Asc)

// #endregion
</script>

<template>
	<div class="max-w-2xl mx-auto flex flex-col gap-2">
		<!-- Sort Order -->
		<div
			class="px-3 py-2 rounded-lg bg-primary-800 border border-primary-600 flex items-center justify-between gap-3"
		>
			<span class="text-sm font-medium text-contrast-500 flex items-center gap-2">
				<Icon icon="material-symbols:sort-rounded" class="text-base" />
				Sort By
			</span>
			<select
				v-model="selectedSort"
				@change="sort(selectedSort)"
				class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-accent-500 flex-1 max-w-48"
			>
				<option v-for="(label, key) in ESortBy" :key="key" :value="label">
					{{ label }}
				</option>
			</select>
		</div>

		<!-- Owned Filter -->
		<div
			class="px-3 py-2 rounded-lg bg-primary-800 border border-primary-600 flex items-center justify-center"
		>
			<ToggleSwitch
				:duo-labels="['Owned Cards', 'All Cards']"
				:model-value="toggledOwned"
				@toggle="toggleOwned"
			/>
		</div>

		<!-- Text Input / Reset -->
		<div
			class="px-3 py-2 rounded-lg bg-primary-800 border border-primary-600 flex items-center gap-2"
		>
			<Icon icon="material-symbols:search-rounded" class="text-contrast-400 text-lg" />
			<input
				v-model="searchInput"
				@keyup="(e) => onSearchInput(e)"
				type="text"
				placeholder="Search card name/description..."
				class="flex-1 px-2 py-1 rounded-md bg-primary-700 border border-primary-600 focus:outline-none focus:border-accent-500 placeholder:text-contrast-400 text-sm"
			/>
			<Button
				icon="material-symbols:filter-alt-off-rounded"
				class="aspect-square"
				size="small"
				@click="onReset"
				v-tooltip.bottom="'Reset all filters'"
			/>
		</div>

		<!-- Staple Filter -->
		<div class="px-3 py-2 rounded-lg bg-primary-800 border border-primary-600">
			<Checkbox
				label="Show only 'Staple' Cards"
				:model-value="toggledStaple"
				@change="toggleStaple"
			/>
		</div>

		<!-- Set Filter -->
		<SetFilterSelector
			v-if="props.showSetFilter"
			v-model="setFilter"
			@change="onSetFilterChange"
		/>

		<!-- Core Card Types -->
		<FilterSection title="Monster/Spell/Trap" @reset="resetCoreType">
			<ToggleButton
				v-for="type in (['Monster', 'Spell', 'Trap'] as TCoreCardType[])"
				:key="type"
				:model-value="toggledCoreType === type"
				@toggle="toggleCoreType(type)"
			>
				<Icon
					icon="material-symbols:credit-card"
					:class="{
						'text-card-effect': type === 'Monster',
						'text-card-spell': type === 'Spell',
						'text-card-trap': type === 'Trap',
					}"
				/>
				<span class="py-1 w-15 font-bold text-sm">{{ type }}</span>
			</ToggleButton>
		</FilterSection>

		<!-- Monster Filters -->
		<template v-if="toggledCoreType === 'Monster'">
			<!-- Attributes -->
			<FilterSection title="Attributes" operand="OR" @reset="attributes.resetAndSearch">
				<ToggleButtonGroup
					:options="EMonsterAttributes"
					:model-value="attributes.items.value"
					@toggle="attributes.toggle"
				>
					<template #default="{option}">
						<AttributeIcon size="small" :attribute="option" />
						<span class="w-13 font-bold text-sm">{{ option }}</span>
					</template>
				</ToggleButtonGroup>
			</FilterSection>

			<!-- Card Type -->
			<FilterSection
				title="Card Type"
				:operand="monsterTypes.operand.value"
				has-operand-toggle
				@reset="monsterTypes.resetAndSearch"
				@toggle-operand="monsterTypes.toggleOperand"
			>
				<ToggleButtonGroup
					:options="EMonsterType"
					:model-value="monsterTypes.items.value"
					@toggle="monsterTypes.toggle"
				/>
			</FilterSection>

			<!-- Monster Race -->
			<FilterSection title="Monster Type" operand="OR" @reset="monsterRaces.resetAndSearch">
				<ToggleButtonGroup
					:options="EMonsterRace"
					:model-value="monsterRaces.items.value"
					@toggle="monsterRaces.toggle"
				/>
			</FilterSection>

			<!-- Level / Rank -->
			<FilterSection title="Level / Rank" operand="OR" @reset="levels.resetAndSearch">
				<ToggleButtonGroup
					:options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
					:model-value="levels.items.value"
					item-width="w-8"
					@toggle="levels.toggle"
				/>
			</FilterSection>

			<!-- ATK/DEF -->
			<FilterSection title="Attack & Defense" operand="AND" @reset="resetAtkDefFilters">
				<div class="flex items-center justify-center flex-col gap-2 w-full">
					<div class="flex gap-2 items-center">
						<span class="font-bold">ATK</span>
						<NumberInputMinMax
							v-model="atkFilter"
							:min-val="-1"
							:max-val="5000"
							@change="onSearch"
						/>
					</div>
					<div class="flex gap-2 items-center">
						<span class="font-bold">DEF</span>
						<NumberInputMinMax
							v-model="defFilter"
							:min-val="-1"
							:max-val="5000"
							@change="onSearch"
						/>
					</div>
					<span class="text-xm text-contrast-400"> Enter '-1' for ?-Values </span>
				</div>
			</FilterSection>

			<!-- Pendulum Scale -->
			<FilterSection title="Pendulum Scale" operand="OR" @reset="scales.resetAndSearch">
				<ToggleButtonGroup
					:options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
					:model-value="scales.items.value"
					item-width="w-8"
					@toggle="scales.toggle"
				/>
			</FilterSection>

			<!-- Link Values -->
			<FilterSection title="Link Values" operand="OR" @reset="linkvals.resetAndSearch">
				<ToggleButtonGroup
					:options="[1, 2, 3, 4, 5, 6, 7, 8]"
					:model-value="linkvals.items.value"
					item-width="w-8"
					@toggle="linkvals.toggle"
				/>
			</FilterSection>

			<!-- Link Markers -->
			<FilterSection
				title="Links"
				:operand="linkMarkers.operand.value"
				has-operand-toggle
				@reset="linkMarkers.resetAndSearch"
				@toggle-operand="linkMarkers.toggleOperand"
			>
				<div class="bg-primary-700 rounded-md">
					<CardLinkSelection v-model="linkMarkers.items.value" @change="onSearch" />
				</div>
			</FilterSection>
		</template>

		<!-- Trap Type -->
		<FilterSection
			v-if="toggledCoreType === 'Trap'"
			title="Trap Type"
			operand="OR"
			@reset="trapTypes.resetAndSearch"
		>
			<ToggleButtonGroup
				:options="ETrapTypes"
				:model-value="trapTypes.items.value"
				@toggle="trapTypes.toggle"
			>
				<template #default="{option}">
					<AttributeIcon size="tiny" :attribute="option" />
					<span class="font-bold text-sm">{{ option }}</span>
				</template>
			</ToggleButtonGroup>
		</FilterSection>

		<!-- Spell Type -->
		<FilterSection
			v-if="toggledCoreType === 'Spell'"
			title="Spell Type"
			operand="OR"
			@reset="spellTypes.resetAndSearch"
		>
			<ToggleButtonGroup
				:options="ESpellTypes"
				:model-value="spellTypes.items.value"
				@toggle="spellTypes.toggle"
			>
				<template #default="{option}">
					<AttributeIcon size="tiny" :attribute="option" />
					<span class="font-bold text-sm">{{ option }}</span>
				</template>
			</ToggleButtonGroup>
		</FilterSection>

		<!-- Info -->
		<div
			v-if="props.showInfoPanel && !toggledCoreType"
			class="px-2 py-2 rounded-lg bg-primary-800/50 border border-primary-600 flex items-center gap-3"
		>
			<p class="text-xs text-contrast-500">
				Select a card type
				<span class="font-medium text-contrast-600">(Monster / Spell / Trap)</span>
				to see more filters.
			</p>
		</div>
	</div>
</template>
