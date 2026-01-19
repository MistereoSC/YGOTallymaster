<script lang="ts" setup>
import {TArchetype} from '@/composables/useArchetypes'
import Button from '@/components/common/Button.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from './CardFullView.vue'
import CardListVirtualGrid from './CardListVirtualGrid.vue'
import CardListVirtualList from './CardListVirtualList.vue'

interface IProps {
	cardList: TCardData[]
	title: string
}
const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
	(e: 'close'): void
}>()
const {settings} = useDatabaseSettings()
const activeCard = ref(props.cardList[0] as TCardData | null)
</script>

<template>
	<div class="grid grid-rows-[auto_1fr] overflow-hidden h-full">
		<div
			class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
		>
			<div class="flex items-center gap-4">
				<Button
					size="small"
					rounded
					icon="material-symbols:keyboard-return-rounded"
					@click="emit('close')"
					v-tooltip.bottom="'Return'"
				/>
				<div class="flex gap-3 items-center">
					<div class="flex flex-col">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
							{{ props.title }}
						</h2>
						<p class="text-xs text-contrast-500">
							<span class="font-medium">{{ props.cardList.length }}</span>
							cards
						</p>
					</div>
				</div>
			</div>
			<div></div>
		</div>

		<div class="h-full overflow-hidden grid grid-cols-[1fr_auto]">
			<div class="h-full overflow-hidden">
				<CardListVirtualList
					v-if="settings?.displayAsList"
					:cardList="props.cardList"
					@card-clicked="(card) => (activeCard = card)"
					:active-card-id="activeCard ? activeCard.id : null"
					:item-size="settings?.listSize || 'medium'"
					:show-owned-heart="true"
					:gray-unowned="settings?.grayUnowned"
					:show-owned-number="settings?.showOwnedNumbers"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:show-card-context-menu="true"
				/>
				<CardListVirtualGrid
					v-else
					:cardList="props.cardList"
					@card-clicked="(card) => (activeCard = card)"
					:active-card-id="activeCard ? activeCard.id : null"
					:item-size="settings?.gridSize || 'medium'"
					:show-owned-heart="true"
					:gray-unowned="settings?.grayUnowned"
					:show-owned-number="settings?.showOwnedNumbers"
					:show-banlist-for="settings?.showBanlistFor || 'none'"
					:show-card-context-menu="true"
				/>
			</div>
			<div
				v-if="activeCard"
				class="border-l border-primary-600 min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView
						:card="activeCard"
						:description-highlighting="settings?.descriptionHighlighting"
						:show-banlist-for="settings?.showBanlistFor || 'none'"
						:show-card-prices="settings?.cardPricesVendor !== 'none'"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
