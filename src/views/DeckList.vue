<script lang="ts" setup>
import DeckCreationModal from '@/components/decks/DeckCreationModal.vue'
import DeckPreview from '@/components/decks/DeckPreview.vue'
import {getFullCardList} from '@/composables/useCardSearch'
import {useDeckList} from '@/composables/useDeckList'
import {TDeckData} from '@/libs/Decks'
import {onBeforeMount, ref} from 'vue'
import DeckCreation from './DeckCreation.vue'
import Spinner from '@/components/common/Spinner.vue'

const decksStore = useDeckList()
onBeforeMount(async () => {
	await getFullCardList()
})

async function onCreateDeck(name: string) {
	await decksStore.createDeck(name)
}

const activeDeck = ref<null | TDeckData>(null)
</script>

<template>
	<div v-if="activeDeck" class="relative h-full overflow-hidden">
		<DeckCreation :deck-data="activeDeck" @close="activeDeck = null" />
	</div>
	<div
		v-else-if="decksStore.initialized.value"
		class="p-8 w-full flex flex-wrap overflow-auto gap-8"
	>
		<DeckPreview
			v-for="deck in decksStore.deckList.value"
			:key="deck.name"
			:deck-data="deck"
			@click="activeDeck = deck"
		/>
		<div
			class="w-48 h-77 grid place-items-center"
			v-if="decksStore.deckList.value.length < 100"
		>
			<DeckCreationModal
				:existing-decks="decksStore.deckList.value"
				@create="(name) => onCreateDeck(name)"
			>
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
</template>

<style lang="scss" scoped></style>
