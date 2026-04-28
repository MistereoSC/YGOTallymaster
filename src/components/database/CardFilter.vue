<script lang="ts" setup>
// -----------------------------------------
// #region Imports, Emits, Props
// -----------------------------------------
import {computed, onMounted, ref, watch, type Ref} from 'vue'
import {
	type TSearchQuery,
	type TCoreCardType,
	ESortBy,
	ESortByPriceCM,
	ESortByPriceTCGP,
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
import FilterSection from './FilterSection.vue'
import ToggleButtonGroup from '@/components/common/ToggleButtonGroup.vue'
import SetFilterSelector from './SetFilterSelector.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'

const props = defineProps<{
	searchWhileTyping?: boolean
	showSetFilter?: boolean
	showInfoPanel?: boolean
	showStaplesToggle?: boolean
}>()
// #endregion
// -----------------------------------------
// #region Search
// -----------------------------------------

const {search, resetSearch, activeQuery, sortedBy, sort} = useCardSearch()
const {settings} = useDatabaseSettings()
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

function onResetSearchInput() {
	searchInput.value = ''
	onSearch()
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

function useToggleArray<T>(defaultOperand: 'AND' | 'OR' | 'NOT' = 'AND') {
	const items = ref<T[]>([]) as Ref<T[]>
	const operand = ref<'AND' | 'OR' | 'NOT'>(defaultOperand)

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

	const toggleOperand = (newOperand?: 'AND' | 'OR' | 'NOT') => {
		if (newOperand) {
			operand.value = newOperand
		} else {
			operand.value = operand.value === 'AND' ? 'OR' : 'AND'
		}
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
			<div class="relative">
				<select
					v-model="selectedSort"
					@change="sort(selectedSort)"
					class="bg-primary-700 text-contrast-700 rounded-md px-3 py-1.5 pr-8 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors appearance-none cursor-pointer"
				>
					<option v-for="(label, key) in ESortBy" :key="key" :value="label">
						{{ label }}
					</option>
					<template v-if="settings?.cardPricesVendor === 'cardmarket_price'">
						<option v-for="(label, key) in ESortByPriceCM" :key="key" :value="label">
							{{ label }}
						</option>
					</template>
					<template v-else-if="settings?.cardPricesVendor === 'tcgplayer_price'">
						<option v-for="(label, key) in ESortByPriceTCGP" :key="key" :value="label">
							{{ label }}
						</option>
					</template>
				</select>
				<Icon
					icon="material-symbols:arrow-drop-down-rounded"
					class="absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 pointer-events-none text-xl"
				/>
			</div>
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
			<div class="relative w-full">
				<Icon
					icon="material-symbols:search-rounded"
					class="absolute left-2.5 top-1/2 -translate-y-1/2 text-contrast-500 text-lg"
				/>
				<input
					v-model="searchInput"
					@keyup="(e) => onSearchInput(e)"
					type="text"
					placeholder="Search card name/description..."
					class="w-full bg-primary-800 text-contrast-700 placeholder-contrast-500 rounded-md pl-9 pr-3 py-1.5 text-sm border border-primary-500 focus:border-accent-500 focus:outline-none transition-colors"
				/>
				<button
					v-if="searchInput"
					@click="() => onResetSearchInput()"
					class="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-contrast-500 hover:text-contrast-700 transition-colors"
				>
					<Icon icon="material-symbols:close-rounded" class="text-lg" />
				</button>
			</div>
			<Button
				icon="material-symbols:filter-alt-off-rounded"
				class="aspect-square"
				size="small"
				@click="() => onReset()"
				v-tooltip.bottom="'Reset all filters'"
			/>
		</div>

		<!-- Staple Filter -->
		<div
			class="px-3 py-2 rounded-lg bg-primary-800 border border-primary-600"
			v-if="props.showStaplesToggle"
		>
			<ToggleSwitch
				label="Show only Cards considered 'Staple'"
				:model-value="toggledStaple"
				@toggle="toggleStaple"
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
				v-for="type in ['Monster', 'Spell', 'Trap']"
				:key="type"
				:model-value="toggledCoreType === type"
				@toggle="toggleCoreType(type as TCoreCardType)"
			>
				<Icon
					icon="material-symbols:credit-card"
					:class="{
						'text-card-effect': type === 'Monster',
						'text-card-spell': type === 'Spell',
						'text-card-trap': type === 'Trap',
					}"
				/>
				<span class="w-15 font-bold text-sm">{{ type }}</span>
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
						<AttributeIcon size="tiny" :attribute="option" />
						<span class="w-13 font-bold text-sm">{{ option }}</span>
					</template>
				</ToggleButtonGroup>
			</FilterSection>

			<!-- Card Type -->
			<FilterSection
				title="Card Type"
				:operand="monsterTypes.operand.value"
				:operand-toggles="['AND', 'OR', 'NOT']"
				@reset="monsterTypes.resetAndSearch"
				@toggle-operand="(e) => monsterTypes.toggleOperand(e as 'AND' | 'OR' | 'NOT')"
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
					itemPtClass="w-6"
					@toggle="levels.toggle"
				/>
			</FilterSection>

			<!-- ATK/DEF -->
			<FilterSection title="Attack & Defense" operand="AND" @reset="resetAtkDefFilters">
				<div class="flex items-center justify-center flex-col gap-2 w-full">
					<div class="flex gap-2 items-center">
						<Icon icon="material-symbols:swords-rounded" class="text-red-400" />
						<NumberInputMinMax
							v-model="atkFilter"
							:min-val="-1"
							:max-val="5000"
							@change="onSearch"
						/>
					</div>
					<div class="flex gap-2 items-center">
						<Icon icon="material-symbols:shield-rounded" class="text-blue-400" />
						<NumberInputMinMax
							v-model="defFilter"
							:min-val="-1"
							:max-val="5000"
							@change="onSearch"
						/>
					</div>
					<span
						class="text-sm font-semibold text-contrast-400"
						v-if="props.showInfoPanel"
					>
						Enter '-1' for ?-Values
					</span>
				</div>
			</FilterSection>

			<!-- Pendulum Scale -->
			<FilterSection title="Pendulum Scale" operand="OR" @reset="scales.resetAndSearch">
				<ToggleButtonGroup
					:options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]"
					:model-value="scales.items.value"
					itemPtClass="w-6"
					@toggle="scales.toggle"
				/>
			</FilterSection>

			<!-- Link Markers -->
			<FilterSection
				title="Links"
				:operand="linkMarkers.operand.value"
				:operand-toggles="['AND', 'OR', 'NOT']"
				@reset="
					() => {
						linkMarkers.reset()
						linkvals.resetAndSearch()
					}
				"
				@toggle-operand="(e) => linkMarkers.toggleOperand(e as 'AND' | 'OR' | 'NOT')"
			>
				<div class="grid grid-cols-[auto_1fr] gap-8">
					<div class="bg-primary-700 rounded-md">
						<CardLinkSelection v-model="linkMarkers.items.value" @change="onSearch" />
					</div>
					<div>
						<div class="flex items-center gap-2 justify-center mb-0.5">
							<span class="text-contrast-500">Link-Values</span>
							<span
								class="text-xs px-1 py-0.5 rounded bg-primary-600 text-contrast-400"
							>
								OR
							</span>
						</div>
						<div class="grid grid-cols-3 gap-2 items-center justify-center">
							<ToggleButtonGroup
								:options="[1, 2, 3, 4, 5, 6]"
								:model-value="linkvals.items.value"
								itemPtClass="w-6"
								@toggle="linkvals.toggle"
							/>
						</div>
					</div>
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
