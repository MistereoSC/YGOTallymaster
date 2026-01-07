<script lang="ts" setup>
import DeckCreationModal from '@/components/decks/DeckCreationModal.vue'
import DeckPreview from '@/components/decks/DeckPreview.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import DeckCreation from '@/components/decks/DeckCreation.vue'
import Spinner from '@/components/common/Spinner.vue'
import ConfirmCancelModal from '@/components/common/ConfirmCancelModal.vue'
import {Icon} from '@iconify/vue'
import Button from '@/components/common/Button.vue'

const {initialized, deckList, createDeck, deleteDeck, renameDeck} = useDeckList()
onBeforeMount(async () => {
	await getFullCardList()
})

async function onCreateDeck(name: string) {
	await createDeck(name)
}

const activeDeck = ref<null | TDeckData>(null)

const deckDeleteModalOpen = ref(false)
const deckRenameModalOpen = ref(false)

const activeDeckForAction = ref<null | TDeckData>(null)
function onDeckDelete(deck: TDeckData) {
	activeDeckForAction.value = deck
	deckDeleteModalOpen.value = true
}
function onDeckRename(deck: TDeckData) {
	activeDeckForAction.value = deck
	deckRenameModalOpen.value = true
}

function onDeckDeleteCancel() {
	deckDeleteModalOpen.value = false
	activeDeckForAction.value = null
}
function onDeckRenameCancel() {
	deckRenameModalOpen.value = false
	activeDeckForAction.value = null
}

async function onDeckDeleteConfirm() {
	if (activeDeckForAction.value) {
		await deleteDeck(activeDeckForAction.value.name)
	}
	onDeckDeleteCancel()
}

async function onDeckRenameConfirm(newName: string) {
	if (activeDeckForAction.value) {
		await renameDeck(activeDeckForAction.value.name, newName)
	}
	onDeckRenameCancel()
}

watch(activeDeck, (newValue, oldValue) => {
	if (newValue !== null && oldValue === null) {
		history.pushState({deckOpen: true}, '')
	}
})

const handlePopState = () => {
	if (activeDeck.value !== null) {
		activeDeck.value = null
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
	<div v-if="activeDeck" class="relative h-full overflow-hidden">
		<DeckCreation :deck-data="activeDeck" @close="activeDeck = null" />
	</div>
	<div
		v-else-if="initialized && deckList.length === 0"
		class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
	>
		<Icon icon="material-symbols:credit-card-off-rounded" class="text-4xl" />
		<p class="text-lg font-medium">No decks found</p>
		<p class="text-sm opacity-75">Let's start by creating your first deck</p>
		<div>
			<DeckCreationModal @create="(name) => onCreateDeck(name)">
				<template #trigger>
					<Button
						class="text-contrast-800 mt-4"
						icon="material-symbols:add-2-rounded"
						label="Create Deck"
					/>
				</template>
			</DeckCreationModal>
		</div>
	</div>
	<div v-else-if="initialized" class="p-8 w-full flex flex-wrap overflow-auto gap-8">
		<DeckPreview
			v-for="deck in deckList"
			:key="deck.name"
			:deck-data="deck"
			@click="activeDeck = deck"
			@delete="() => onDeckDelete(deck)"
			@rename="() => onDeckRename(deck)"
		/>
		<div class="w-48 h-77 grid place-items-center" v-if="deckList.length < 200">
			<DeckCreationModal :existing-decks="deckList" @create="(name) => onCreateDeck(name)">
				<template #trigger>
					<div
						class="h-full w-full rounded-lg text-contrast-400 hover:text-contrast-900 bg-primary-700 cursor-pointer shadow-lg transition-colors hover:bg-primary-600"
					>
						<div
							class="select-none h-full w-full flex justify-center items-center flex-col font-bold"
						>
							<span class="text-4xl">+</span>
							<span class="">Add Deck</span>
						</div>
					</div>
				</template>
			</DeckCreationModal>
		</div>
	</div>

	<div v-else class="w-full h-full">
		<div class="w-full h-full flex flex-col justify-center items-center gap-4">
			<Spinner />
		</div>
	</div>

	<ConfirmCancelModal
		:open="deckDeleteModalOpen"
		heading-text="Delete Deck"
		cancel-text="Cancel"
		confirm-text="Delete"
		@cancel="onDeckDeleteCancel"
		@confirm="onDeckDeleteConfirm"
	>
		<template #content>
			<p>
				Are you sure you want to delete the deck "{{ activeDeckForAction?.name }}"? This
				action cannot be undone.
			</p>
		</template>
	</ConfirmCancelModal>

	<DeckCreationModal
		:open="deckRenameModalOpen"
		:existing-decks="deckList"
		@create="(name) => onDeckRenameConfirm(name)"
		:existing-deck-name-for-rename="activeDeckForAction?.name"
	/>
</template>

<style lang="scss" scoped></style>
