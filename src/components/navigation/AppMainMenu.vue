<script lang="ts" setup>
import {computed, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import AppMainMenuLink from './AppMainMenuLink.vue'

const props = defineProps<{
	message?: string
}>()
const emit = defineEmits([])
onMounted(() => {
	return
})

const route = useRoute()
const activeRoute = computed(() => route.name as string)
</script>

<template>
	<div
		class="bg-primary-900 w-40 h-full grid grid-rows-[1fr_auto] shadow-lg py-2"
	>
		<div>
			<AppMainMenuLink
				label="Database"
				icon="material-symbols:database"
				route-name="Database"
				:active="activeRoute === 'Database'"
			/>
			<AppMainMenuLink
				label="Collection"
				icon="material-symbols:cards-star-rounded"
				route-name="Collection"
				:active="activeRoute === 'Collection'"
			/>
			<AppMainMenuLink
				label="Decks"
				icon="material-symbols:stacks-rounded"
				route-name="Decks"
				:active="activeRoute === 'Decks'"
			/>
			<AppMainMenuLink
				label="Sets"
				icon="material-symbols:bookmark-heart-rounded"
				route-name="Sets"
				:active="activeRoute === 'Sets'"
			/>
		</div>
		<div>
			<div class="w-full h-px bg-primary-500 my-2"></div>
			<AppMainMenuLink
				label="About"
				icon="material-symbols:chat-info-rounded"
				route-name="About"
				:active="activeRoute === 'About'"
			/>

			<AppMainMenuLink
				label="Settings"
				icon="material-symbols:settings-rounded"
				route-name="Settings"
				:active="activeRoute === 'Settings'"
			/>
			<AppMainMenuLink
				label="Updater"
				icon="material-symbols:browser-updated-rounded"
				route-name="Home"
				:active="activeRoute === 'Home'"
			/>
			<AppMainMenuLink
				label="Theme"
				icon="material-symbols:frame-bug-rounded"
				route-name="Debug/ThemePreview"
				:active="activeRoute === 'Debug/ThemePreview'"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
