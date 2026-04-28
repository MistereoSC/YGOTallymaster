<script lang="ts" setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import AppMainMenuLink from './AppMainMenuLink.vue'
import {useMainMenu} from '@/composables/useMainMenu'
import {Icon} from '@iconify/vue'

const menu = useMainMenu()
const route = useRoute()
const activeRoute = computed(() => route.name as string)
</script>

<template>
	<div class="relative">
		<div
			class="bg-primary-900 w-40 h-full grid grid-rows-[1fr_auto] shadow-lg py-2 overflow-x-hidden"
			:class="{'w-12! ': !menu.expanded.value}"
			style="transition: width 0.2s ease-out"
		>
			<div>
				<AppMainMenuLink
					label="Database"
					icon="material-symbols:database"
					route-name="Database"
					:active="activeRoute === 'Database'"
				/>
				<AppMainMenuLink
					label="Archetypes"
					icon="material-symbols:cards-stack"
					route-name="Archetypes"
					:active="activeRoute === 'Archetypes'"
				/>
				<AppMainMenuLink
					label="Releases"
					icon="material-symbols:calendar-month-rounded"
					route-name="Releases"
					:active="activeRoute === 'Releases'"
				/>
				<AppMainMenuLink
					label="Banlist"
					icon="material-symbols:block-outline"
					route-name="Banlist"
					:active="activeRoute === 'Banlist'"
				/>
				<div class="w-full h-px bg-primary-500 my-2"></div>
				<AppMainMenuLink
					label="Decks"
					icon="material-symbols:stacks-rounded"
					route-name="Decks"
					:active="activeRoute === 'Decks'"
				/>
				<AppMainMenuLink
					label="Lists"
					icon="material-symbols:bookmark-heart-rounded"
					route-name="Lists"
					:active="activeRoute === 'Lists'"
				/>
				<AppMainMenuLink
					label="Statistics"
					icon="material-symbols:bar-chart-rounded"
					route-name="Statistics"
					:active="activeRoute === 'Statistics'"
				/>
			</div>
			<div>
				<!-- <div class="w-full h-px bg-primary-500 my-2"></div> -->
				<AppMainMenuLink
					label="Settings"
					icon="material-symbols:settings-rounded"
					route-name="Settings"
					:active="activeRoute === 'Settings'"
				/>
			</div>
		</div>

		<div class="absolute right-1.5 top-1/2 delay-200 -translate-y-1/2 w-8 h-8 z-2">
			<div
				class="w-full h-full flex justify-center items-center cursor-pointer bg-primary-800 hover:bg-primary-700 rounded-full text-contrast-400 hover:text-contrast-900"
				@click="menu.expanded.value = !menu.expanded.value"
			>
				<Icon
					class="text-2xl pl-1"
					:class="{'rotate-180': menu.expanded.value}"
					style="transition: rotate 0.3s"
					icon="material-symbols:chevron-right-rounded"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
