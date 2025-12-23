<script lang="ts" setup>
// -----------------------------------------
// #region Imports, Emits, Props
// -----------------------------------------
import {computed, onMounted, ref, watch} from 'vue'
import {
	type TSearchQuery,
	type TCoreCardType,
	useCardSearch,
} from '@/composables/useCardSearch'
import ToggleButton from '../common/ToggleButton.vue'
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
import Button from '../common/Button.vue'
import {Icon} from '@iconify/vue'
import ToggleSwitch from '../common/ToggleSwitch.vue'
import NumberInputMinMax from '../common/NumberInputMinMax.vue'
import CardLinkSelection from './CardLinkSelection.vue'

const props = defineProps<{
	searchWhileTyping?: boolean
}>()
const emit = defineEmits<{
	(e: 'submit', value: string): void
}>()

// #endregion
// -----------------------------------------
// #region Search
// -----------------------------------------

const {search, resetSearch, activeQuery} = useCardSearch()
const searchInput = ref(activeQuery.value.term || '')

function onSearch() {
	search(query.value)
}

function onReset(fullReset = true) {
	toggledAttributes.value = []
	toggledMonsterRaces.value = []
	toggledMonsterTypes.value = []
	toggledMonsterTypesOperand.value = 'AND'
	toggledSpellTypes.value = []
	toggledTrapTypes.value = []
	toggledLinkMarkers.value = []
	toggledLinkMarkersOperand.value = 'AND'
	atkFilter.value = [null, null]
	defFilter.value = [null, null]
	toggledLevels.value = []
	toggledScales.value = []
	toggledLinkvals.value = []

	if (fullReset) {
		searchInput.value = ''
		toggledCoreType.value = null
		resetSearch()
	}
}

const DEBOUNCE_DELYAY = 100
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
	}, DEBOUNCE_DELYAY)
}
// #endregion
// -----------------------------------------
// #region Filter Fields
// -----------------------------------------

const toggledAttributes = ref<TMonsterAttribute[]>([])
function resetAttributes() {
	toggledAttributes.value = []
	onSearch()
}
function toggleAttribute(attribute: TMonsterAttribute) {
	const index = toggledAttributes.value.indexOf(attribute)
	if (index === -1) toggledAttributes.value.push(attribute)
	else toggledAttributes.value.splice(index, 1)
	onSearch()
}

const toggledMonsterTypesOperand = ref<'AND' | 'OR'>('AND')
const toggledMonsterTypes = ref<TMonsterType[]>([])
function resetMonsterTypes() {
	toggledMonsterTypes.value = []
	toggledMonsterTypesOperand.value = 'AND'
	onSearch()
}
function toggleMonsterType(type: TMonsterType) {
	const index = toggledMonsterTypes.value.indexOf(type)
	if (index === -1) toggledMonsterTypes.value.push(type)
	else toggledMonsterTypes.value.splice(index, 1)
	onSearch()
}
function toggleMonsterTypesOperand() {
	toggledMonsterTypesOperand.value =
		toggledMonsterTypesOperand.value === 'AND' ? 'OR' : 'AND'
	if (toggledMonsterTypes.value.length > 0) onSearch()
}

const toggledMonsterRaces = ref<TMonsterRace[]>([])
function resetMonsterRaces() {
	toggledMonsterRaces.value = []
	onSearch()
}
function toggleMonsterRace(race: TMonsterRace) {
	const index = toggledMonsterRaces.value.indexOf(race)
	if (index === -1) toggledMonsterRaces.value.push(race)
	else toggledMonsterRaces.value.splice(index, 1)
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
	onReset(false)
	onSearch()
}

const toggledTrapTypes = ref<TTrapTypes[]>([])
function resetTrapTypes() {
	toggledTrapTypes.value = []
	onSearch()
}
function toggleTrapType(type: TTrapTypes) {
	const index = toggledTrapTypes.value.indexOf(type)
	if (index === -1) toggledTrapTypes.value.push(type)
	else toggledTrapTypes.value.splice(index, 1)
	onSearch()
}

const toggledSpellTypes = ref<TSpellTypes[]>([])
function resetSpellTypes() {
	toggledSpellTypes.value = []
	onSearch()
}
function toggleSpellType(type: TSpellTypes) {
	const index = toggledSpellTypes.value.indexOf(type)
	if (index === -1) toggledSpellTypes.value.push(type)
	else toggledSpellTypes.value.splice(index, 1)
	onSearch()
}

const atkFilter = ref<[number | null, number | null]>([null, null])
const defFilter = ref<[number | null, number | null]>([null, null])
watch([atkFilter, defFilter], () => {
	onSearch()
})
function resetAtkDefFilters() {
	atkFilter.value = [null, null]
	defFilter.value = [null, null]
}

const toggledLevels = ref<number[]>([])
function resetLevels() {
	toggledLevels.value = []
	onSearch()
}
function toggleLevel(level: number) {
	const index = toggledLevels.value.indexOf(level)
	if (index === -1) toggledLevels.value.push(level)
	else toggledLevels.value.splice(index, 1)
	onSearch()
}

const toggledScales = ref<number[]>([])
function resetScales() {
	toggledScales.value = []
	onSearch()
}
function toggleScale(scale: number) {
	const index = toggledScales.value.indexOf(scale)
	if (index === -1) toggledScales.value.push(scale)
	else toggledScales.value.splice(index, 1)
	onSearch()
}

const toggledLinkvals = ref<number[]>([])
function resetLinkvals() {
	toggledLinkvals.value = []
	onSearch()
}
function toggleLinkval(linkval: number) {
	const index = toggledLinkvals.value.indexOf(linkval)
	if (index === -1) toggledLinkvals.value.push(linkval)
	else toggledLinkvals.value.splice(index, 1)
	onSearch()
}

const toggledLinkMarkers = ref<TLinkMarkers[]>([])
const toggledLinkMarkersOperand = ref<'AND' | 'OR'>('AND')
function resetLinkMarkers() {
	toggledLinkMarkers.value = []
	toggledLinkMarkersOperand.value = 'AND'
	onSearch()
}
function toggleMonsterTypesOperandLinkMarkers() {
	toggledLinkMarkersOperand.value =
		toggledLinkMarkersOperand.value === 'AND' ? 'OR' : 'AND'
	if (toggledLinkMarkers.value.length > 0) onSearch()
}
watch(toggledLinkMarkers, () => {
	onSearch()
})

// #endregion
// -----------------------------------------
// #region Setup
// -----------------------------------------
onMounted(() => {
	_applyActiveQuery()
})
function _applyActiveQuery() {
	searchInput.value = activeQuery.value.term || ''
	toggledAttributes.value = activeQuery.value.attributes || []
	toggledCoreType.value = activeQuery.value.coreCardType || null
	toggledMonsterRaces.value = activeQuery.value.monsterRaces || []
	toggledMonsterTypes.value = activeQuery.value.monsterTypes
		? activeQuery.value.monsterTypes.terms
		: []
	toggledMonsterTypesOperand.value = activeQuery.value.monsterTypes
		? activeQuery.value.monsterTypes.operand
		: 'AND'
	toggledSpellTypes.value = activeQuery.value.spellTypes || []
	toggledTrapTypes.value = activeQuery.value.trapTypes || []

	atkFilter.value = [
		activeQuery.value.atk?.lte ?? null,
		activeQuery.value.atk?.gte ?? null,
	]
	defFilter.value = [
		activeQuery.value.def?.lte ?? null,
		activeQuery.value.def?.gte ?? null,
	]
	toggledLevels.value = activeQuery.value.levels || []
	toggledScales.value = activeQuery.value.scales || []
	toggledLinkvals.value = activeQuery.value.linkvals || []
	toggledLinkMarkers.value = activeQuery.value.links?.terms || []
	toggledLinkMarkersOperand.value = activeQuery.value.links?.operand || 'AND'
}
const query = computed<TSearchQuery>(() => {
	return {
		term: searchInput.value,
		attributes: toggledAttributes.value,
		coreCardType: toggledCoreType.value ?? undefined,
		monsterRaces:
			toggledMonsterRaces.value.length > 0
				? toggledMonsterRaces.value
				: undefined,
		monsterTypes:
			toggledMonsterTypes.value.length > 0
				? {
						terms: toggledMonsterTypes.value,
						operand: toggledMonsterTypesOperand.value,
				  }
				: undefined,
		spellTypes:
			toggledSpellTypes.value.length > 0
				? toggledSpellTypes.value
				: undefined,
		trapTypes:
			toggledTrapTypes.value.length > 0
				? toggledTrapTypes.value
				: undefined,
		levels:
			toggledLevels.value.length > 0 ? toggledLevels.value : undefined,
		scales:
			toggledScales.value.length > 0 ? toggledScales.value : undefined,
		linkvals:
			toggledLinkvals.value.length > 0
				? toggledLinkvals.value
				: undefined,
		links:
			toggledLinkMarkers.value.length > 0
				? {
						terms: toggledLinkMarkers.value,
						operand: toggledLinkMarkersOperand.value,
				  }
				: undefined,
		atk: {lte: atkFilter.value[0], gte: atkFilter.value[1]},
		def: {lte: defFilter.value[0], gte: defFilter.value[1]},
	}
})
// #endregion
// -----------------------------------------
</script>

<template>
	<div class="max-w-2xl mx-auto flex flex-col gap-2">
		<!-- Text Input / Reset -->
		<div
			class="p-2 rounded-md bg-primary-800 grid grid-cols-[1fr_auto] gap-2"
		>
			<input
				v-model="searchInput"
				@keyup="(e) => onSearchInput(e)"
				type="text"
				placeholder="Search Cards..."
				class="w-full px-2 py-1 rounded-md bg-primary-700 border border-primary-600 focus:outline-none focus:border-accent-500 placeholder:text-contrast-500"
			/>
			<Button
				icon="material-symbols:filter-alt-off-rounded"
				@click="onReset"
				class="w-full p-2 rounded-md bg-accent-500 hover:bg-accent-400"
			/>
		</div>

		<!-- Core Card Types -->
		<div class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col">
			<h3 class="font-bold m-0 flex gap-2">
				<span>Monster/Spell/Trap</span>
				<Button
					@click="resetCoreType"
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
				/>
			</h3>
			<div class="flex gap-3 flex-wrap items-center justify-center">
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
			</div>
		</div>

		<!-- Monster | Attributes -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Attributes</span>
				<span class="text-contrast-400">(OR)</span>
				<Button
					@click="resetAttributes"
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
				/>
			</h3>
			<div class="flex gap-3 flex-wrap items-center justify-center">
				<ToggleButton
					v-for="attribute in Object.values(EMonsterAttributes)"
					:key="attribute"
					:model-value="toggledAttributes.includes(attribute)"
					@toggle="toggleAttribute(attribute)"
				>
					<AttributeIcon size="small" :attribute="attribute" />
					<span class="w-13 font-bold text-sm">{{ attribute }}</span>
				</ToggleButton>
			</div>
		</div>

		<!-- Monster | Type -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 grid grid-cols-[auto_auto_1fr] gap-2">
				<span>Card Type</span>
				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetMonsterTypes"
				/>
				<div class="flex justify-end">
					<ToggleSwitch
						:duo-labels="['AND', 'OR']"
						:model-value="toggledMonsterTypesOperand === 'AND'"
						@toggle="toggleMonsterTypesOperand"
					/>
				</div>
			</h3>
			<div class="">
				<div class="flex gap-3 flex-wrap items-center">
					<ToggleButton
						v-for="type in Object.values(EMonsterType)"
						:key="type"
						:model-value="toggledMonsterTypes.includes(type)"
						@toggle="toggleMonsterType(type)"
					>
						<span class="font-bold text-sm">{{ type }}</span>
					</ToggleButton>
				</div>
			</div>
		</div>

		<!-- Monster | Race -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Monster Type</span>
				<span class="text-contrast-400">(OR)</span>

				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetMonsterRaces"
				/>
			</h3>
			<div class="">
				<div class="flex gap-3 flex-wrap items-center">
					<ToggleButton
						v-for="race in Object.values(EMonsterRace)"
						:key="race"
						:model-value="toggledMonsterRaces.includes(race)"
						@toggle="toggleMonsterRace(race)"
					>
						<span class="font-bold text-sm">{{ race }}</span>
					</ToggleButton>
				</div>
			</div>
		</div>

		<!-- Monster | Level -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Level / Rank</span>
				<span class="text-contrast-400">(OR)</span>

				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetLevels"
				/>
			</h3>
			<div class="flex flex-wrap gap-2">
				<ToggleButton
					v-for="lvl in 13"
					:key="lvl"
					:model-value="toggledLevels.includes(lvl)"
					@toggle="toggleLevel(lvl)"
				>
					<span class="w-8 font-bold text-sm">{{ lvl }}</span>
				</ToggleButton>
			</div>
		</div>

		<!-- Monster | Stats -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Attack & Defense</span>
				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetAtkDefFilters"
				/>
			</h3>
			<div class="flex gap-2 items-center pl-4">
				<span class="font-bold">ATK</span>
				<NumberInputMinMax
					v-model="atkFilter"
					:min-val="-1"
					:max-val="5000"
				/>
			</div>
			<div class="flex gap-2 items-center pl-4">
				<span class="font-bold">DEF</span>
				<NumberInputMinMax
					v-model="defFilter"
					:min-val="-1"
					:max-val="5000"
				/>
			</div>
		</div>

		<!-- Monster | Pendulum Scale -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Pendulum Scale</span>
				<span class="text-contrast-400">(OR)</span>

				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetScales"
				/>
			</h3>
			<div class="flex flex-wrap gap-2">
				<ToggleButton
					v-for="scale in 13"
					:key="scale"
					:model-value="toggledScales.includes(scale)"
					@toggle="toggleScale(scale)"
				>
					<span class="w-8 font-bold text-sm">{{ scale }}</span>
				</ToggleButton>
			</div>
		</div>
		<!-- Monster | Linkvals -->
		<div
			v-if="toggledCoreType === 'Monster'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Link Values</span>
				<span class="text-contrast-400">(OR)</span>

				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetLinkvals"
				/>
			</h3>

			<div>
				<div class="flex flex-wrap gap-2">
					<ToggleButton
						v-for="linkval in 8"
						:key="linkval"
						:model-value="toggledLinkvals.includes(linkval)"
						@toggle="toggleLinkval(linkval)"
					>
						<span class="w-8 font-bold text-sm">{{ linkval }}</span>
					</ToggleButton>
				</div>
			</div>
			<h3 class="font-bold m-0 grid grid-cols-[auto_auto_1fr] gap-2 mt-4">
				<span>Links</span>

				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetLinkMarkers"
				/>
				<div class="flex justify-end">
					<ToggleSwitch
						:duo-labels="['AND', 'OR']"
						:model-value="toggledLinkMarkersOperand === 'AND'"
						@toggle="toggleMonsterTypesOperandLinkMarkers"
					/>
				</div>
			</h3>
			<div class="flex justify-center">
				<div class="bg-primary-700 rounded-md">
					<CardLinkSelection v-model="toggledLinkMarkers" />
				</div>
			</div>
		</div>

		<!-- Trap Type -->
		<div
			v-if="toggledCoreType === 'Trap'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Trap Type</span>
				<span class="text-contrast-400">(OR)</span>
				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetTrapTypes"
				/>
			</h3>
			<div class="">
				<div class="flex gap-3 flex-wrap items-center">
					<ToggleButton
						v-for="type in Object.values(ETrapTypes)"
						:key="type"
						:model-value="toggledTrapTypes.includes(type)"
						@toggle="toggleTrapType(type)"
					>
						<span class="font-bold text-sm">{{ type }}</span>
					</ToggleButton>
				</div>
			</div>
		</div>

		<!-- Spell Type -->
		<div
			v-if="toggledCoreType === 'Spell'"
			class="p-2 rounded-md bg-primary-800 gap-2 flex flex-col"
		>
			<h3 class="font-bold m-0 flex gap-2">
				<span>Spell Type</span>
				<span class="text-contrast-400">(OR)</span>
				<Button
					icon="material-symbols:reset-settings-outline-rounded"
					rounded
					size="small"
					@click="resetSpellTypes"
				/>
			</h3>
			<div class="">
				<div class="flex gap-3 flex-wrap items-center">
					<ToggleButton
						v-for="type in Object.values(ESpellTypes)"
						:key="type"
						:model-value="toggledSpellTypes.includes(type)"
						@toggle="toggleSpellType(type)"
					>
						<span class="font-bold text-sm">{{ type }}</span>
					</ToggleButton>
				</div>
			</div>
		</div>

		<!-- Info -->
		<div
			v-if="!toggledCoreType"
			class="text-sm font-semibold p-2 rounded-md bg-primary-800"
		>
			Select a Card Type
			<span class="text-contrast-500"> (Monster / Spell / Trap) </span>
			for more Filters.
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
