<script lang="ts" setup>
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useOwnedCards} from '@/composables/useOwnedCards'
import {onMounted} from 'vue'

const {ownedCardList, resetSearch} = useOwnedCards()
const {settings} = useDatabaseSettings()

onMounted(() => {
	resetSearch()
})
</script>

<template>
	<div class="p-4">
		<div v-if="ownedCardList">
			<CardListVirtualGrid
				:card-list="ownedCardList"
				:show-owned-number="settings?.showOwnedNumbers"
				:gray-unowned-cards="settings?.grayUnowned"
				:show-banlist-for="settings?.showBanlistFor"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
