<script lang="ts" setup>
import {TDeckData} from '@/libs/Decks'
import {computed} from 'vue'
import CardPreview from '@/components/database/CardPreview.vue'
import {TCardData} from '@/libs/interfaces/YGOProInterfaces'
import {_find} from '@/composables/useCardSearch'
import ContextMenu from '@/components/common/ContextMenu.vue'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	deckData: TDeckData
}>()
const emit = defineEmits<{
	(e: 'click'): void
	(e: 'rename'): void
	(e: 'delete'): void
}>()

const previewCard = computed<TCardData | null>(() => {
	return _find.ID(props.deckData.main[0]) || null
})

const menuItems = [
	{
		label: 'Rename Deck',
		icon: 'material-symbols:edit-outline-rounded',
		action: () => emit('rename'),
	},
	{
		label: 'Delete Deck',
		icon: 'material-symbols:delete-rounded',
		action: () => emit('delete'),
	},
]
</script>

<template>
	<ContextMenu :items="menuItems">
		<template #trigger>
			<div
				class="select-none relative w-56 h-77 overflow-hidden cursor-pointer deckbox group"
				@click="emit('click')"
			>
				<!-- 3D Deckbox Structure -->
				<div class="grid-cols-[174px_auto] grid-rows-[auto_auto] grid gap-0.5">
					<!-- Top face -->
					<div class="bg-accent-400 w-43.5 h-12 rounded-sm top-shell">
						<!-- Decorative pattern on top -->
						<div class="w-full h-full opacity-20 overflow-hidden">
							<div
								class="w-full h-full"
								style="
									background: repeating-linear-gradient(
										45deg,
										transparent,
										transparent 4px,
										rgba(255, 255, 255, 0.1) 4px,
										rgba(255, 255, 255, 0.1) 8px
									);
								"
							></div>
						</div>
					</div>
					<b></b>
					<!-- Front face with card preview -->
					<div class="bg-accent-500 w-43.25 h-64.5 rounded-sm center-shell relative">
						<CardPreview
							v-if="previewCard"
							:card="previewCard"
							size="medium"
							show-banlist-for="none"
							class="pointer-events-none center-shell-image"
						/>
						<!-- Gradient overlay for better text readability -->
						<div
							class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-primary-900/90 via-primary-900/60 to-transparent pointer-events-none"
						></div>
						<!-- Card info overlay -->
						<div
							class="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none"
						>
							<p class="font-bold text-sm drop-shadow-lg">
								{{ deckData.name }}
							</p>
							<div
								class="flex justify-center items-center gap-3 mt-1 text-xs text-contrast-400"
							>
								<span
									class="flex items-center gap-1"
									:class="{
										'text-red-400':
											deckData.main.length < 40 || deckData.main.length > 60,
									}"
								>
									<Icon
										icon="material-symbols:playing-cards-rounded"
										class="text-sm"
									/>
									{{ deckData.main.length }}
								</span>
								<span
									class="flex items-center gap-1"
									:class="{'text-red-400': deckData.extra.length > 15}"
								>
									<Icon
										icon="material-symbols:auto-awesome-rounded"
										class="text-sm"
									/>
									{{ deckData.extra.length }}
								</span>
								<span
									class="flex items-center gap-1"
									:class="{'text-red-400': deckData.side.length > 15}"
								>
									<Icon
										icon="material-symbols:swap-horiz-rounded"
										class="text-sm"
									/>
									{{ deckData.side.length }}
								</span>
							</div>
						</div>
					</div>
					<!-- Right face (spine) -->
					<div class="bg-accent-600 w-12 h-64.75 rounded-sm right-shell relative">
						<!-- Decorative lines on spine -->
						<div class="absolute inset-0 overflow-hidden opacity-30">
							<div class="absolute top-4 left-2 right-2 h-0.5 bg-accent-300"></div>
							<div class="absolute bottom-4 left-2 right-2 h-0.5 bg-accent-300"></div>
						</div>
						<div
							class="justify-center absolute inset-0 flex items-center font-bold text-accent-200 p-4 text-xs tracking-wider"
							style="text-orientation: mixed; writing-mode: vertical-rl"
						>
							{{ deckData.name }}
						</div>
					</div>
				</div>
				<!-- Hover glow effect -->
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"
					style="
						box-shadow: inset 0 0 30px rgba(var(--color-accent-400-rgb), 0.2),
							0 0 20px rgba(var(--color-accent-500-rgb), 0.15);
					"
				></div>
			</div>
		</template>
	</ContextMenu>
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
