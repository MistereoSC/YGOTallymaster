<script lang="ts" setup>
import {ref} from 'vue'
import {useCardSearch} from '@/composables/useCardSearch'

const props = defineProps<{
	searchWhileTyping?: boolean
}>()
const emit = defineEmits<{
	(e: 'submit', value: string): void
}>()

const {searchResults, search, resetSearch, activeQuery} = useCardSearch()
const searchInput = ref(activeQuery.value.term || '')

function onSearch() {
	const input = searchInput.value.trim()
	if (input === '') {
		resetSearch()
		return
	}
	if (input.length < 2) {
		return
	}
	search(input)
}

function onReset() {
	searchInput.value = ''
	resetSearch()
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
</script>

<template>
	<div class="max-w-2xl mx-auto flex flex-col gap-2">
		<div class="p-4 rounded-md bg-primary-800">
			<input
				v-model="searchInput"
				@keyup="(e) => onSearchInput(e)"
				type="text"
				placeholder="Search Cards..."
				class="w-full p-2 rounded-md bg-primary-700 border border-primary-600 text-contrast-200 focus:outline-none focus:border-accent-500"
			/>
		</div>

		<div class="p-4 rounded-md bg-primary-800 flex gap-4">
			<button
				@click="onSearch"
				class="w-full p-2 rounded-md bg-accent-500 text-contrast-200 hover:bg-accent-400"
			>
				Search
			</button>
			<button
				@click="onReset"
				class="w-full p-2 rounded-md bg-accent-500 text-contrast-200 hover:bg-accent-400"
			>
				Reset
			</button>
		</div>

		<div class="rounded-md bg-primary-800 overflow-hidden p-2">
			<div>{{ searchResults.length }} Results</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
