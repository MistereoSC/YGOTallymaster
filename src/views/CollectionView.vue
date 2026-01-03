<script lang="ts" setup>
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {useOwnedCards} from '@/composables/useOwnedCards'
import {onMounted} from 'vue'

const {cardList} = useOwnedCards()
const {settings} = useDatabaseSettings()

onMounted(async () => {})
</script>

<template>
	<div class="p-4">
		<div v-if="cardList">
			<CardListVirtualGrid
				:card-list="cardList.fullCardList"
				:show-owned-number="settings?.showOwnedNumbers"
				:gray-unowned-cards="settings?.grayUnowned"
				:show-banlist-for="settings?.showBanlistFor"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
