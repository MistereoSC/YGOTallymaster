<script lang="ts" setup>
import {TArchetype} from '@/composables/useArchetypes'
import Button from '@/components/common/Button.vue'
import VirtualGridCustom from './VirtualGridCustom.vue'
import CardPreview from './CardPreview.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import {ref} from 'vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from './CardFullView.vue'

interface IProps {
	archetype: TArchetype
}
const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
	(e: 'close'): void
}>()
const {settings} = useDatabaseSettings()
const activeCard = ref(props.archetype.cards[0] as TCardData | null)
</script>

<template>
	<div class="grid grid-rows-[auto_1fr] overflow-hidden h-full">
		<div class="bg-primary-600 p-1 flex justify-between items-center">
			<div class="flex items-center gap-4">
				<Button
					size="small"
					rounded
					icon="material-symbols:arrow-back-rounded"
					@click="emit('close')"
				/>
				<span class="font-bold">{{ props.archetype.name }}</span>
				<span class="font-bold text-contrast-600 pl-8">
					{{ props.archetype.count }} Cards
				</span>
			</div>
			<div></div>
		</div>

		<div class="h-full overflow-hidden grid grid-cols-[1fr_auto]">
			<div class="h-full overflow-hidden">
				<VirtualGridCustom
					:items="props.archetype.cards"
					:item-dimensions="{width: 173, height: 258}"
				>
					<template #item="{item: card, index}">
						<CardPreview
							:card="card"
							size="medium"
							:show-banlist-for="settings?.showBanlistFor || 'none'"
							@click="activeCard = card"
							:active="activeCard?.id === card.id"
						/>
					</template>
				</VirtualGridCustom>
			</div>
			<div
				v-if="activeCard"
				class="min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full grid grid-rows-[auto_1fr] overflow-hidden"
			>
				<div class="h-full overflow-y-auto scrollable p-3">
					<CardFullView :card="activeCard" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
