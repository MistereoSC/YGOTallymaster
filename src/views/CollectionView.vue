<script lang="ts" setup>
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useOwnedCards} from '@/composables/useOwnedCards'
import {onMounted} from 'vue'

const cardStore = useOwnedCards()
const settingsStore = useDatabaseSettings()

onMounted(async () => {})
</script>

<template>
	<div class="p-4">
		<div v-if="cardStore.cardList.value">
			<CardListVirtualGrid
				:card-list="cardStore.cardList.value.fullCardList"
				:show-owned-number="
					settingsStore.settings.value?.showOwnedNumbers
				"
				:gray-unowned-cards="settingsStore.settings.value?.grayUnowned"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
