<script lang="ts" setup>
import CardListVirtualGrid from '@/components/database/CardListVirtualGrid.vue'
import {useOwnedCards} from '@/composables/useOwnedCards'
import {onMounted} from 'vue'

let store = useOwnedCards()
onMounted(async () => {})
</script>

<template>
	<div class="p-4">
		<div v-if="store.cardList.value">
			<CardListVirtualGrid
				:card-list="store.cardList.value.fullCardList"
				:show-owned-heart="true"
				:show-owned-number="true"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
