<script lang="ts" setup>
import {TDeckData} from '@/libs/Decks'
import {computed} from 'vue'
import CardPreview from '@/components/database/CardPreview.vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {_find} from '@/composables/useCardSearch'

const props = defineProps<{
	deckData: TDeckData
}>()
const emit = defineEmits<{
	(e: 'click'): void
}>()

const previewCard = computed<TCardData | null>(() => {
	return _find.ID(props.deckData.main[0]) || null
})
</script>

<template>
	<div
		class="select-none relative w-56 h-77 overflow-hidden cursor-pointer deckbox"
		@click="emit('click')"
	>
		<div class="grid-cols-[174px_auto] grid-rows-[auto_auto] grid gap-0.5">
			<div class="bg-accent-400 w-43.5 h-12 rounded-sm top-shell"></div>
			<b></b>
			<div class="bg-accent-500 w-43.25 h-64.5 rounded-sm center-shell">
				<CardPreview
					v-if="previewCard"
					:card="previewCard"
					size="medium"
					class="pointer-events-none center-shell-image"
				/>
			</div>
			<div class="bg-accent-600 w-12 h-64.75 rounded-sm right-shell relative">
				<div
					class="justify-center absolute inset-0 flex items-center font-bold text-accent-200 p-4 text-sm"
					style="text-orientation: mixed; writing-mode: vertical-rl; letter-spacing: 2px"
				>
					{{ deckData.name }}
				</div>
			</div>
		</div>
		<div
			class="absolute bottom-0 left-0 w-43.25 p-1 bg-primary-800/50 rounded-b-sm text-sm font-semibold flex flex-col"
		>
			<span class="truncate">{{ deckData.name }}</span>
			<span class="text-contrast-600">
				({{ deckData.main.length }}/{{ deckData.extra.length }}/{{ deckData.side.length }})
			</span>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.top-shell {
	transition: background-color 0.2s;
	transform-origin: bottom left;
	transform: skew(-45deg);
}
.right-shell {
	transition: background-color 0.2s;
	transform-origin: bottom left;
	transform: skewY(-45deg);
}
.center-shell {
	transition: background-color 0.2s;
}
.center-shell-image {
	transition: filter 0.2s;
	filter: grayscale(0.5);
}
.deckbox:hover {
	.top-shell {
		background-color: var(--color-accent-300);
	}
	.center-shell {
		background-color: var(--color-accent-400);
	}
	.right-shell {
		background-color: var(--color-accent-500);
	}
	.center-shell-image {
		filter: grayscale(0);
	}
}
</style>
