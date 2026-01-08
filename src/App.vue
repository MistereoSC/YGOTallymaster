<script setup lang="ts">
import AppMainMenu from '@/components/navigation/AppMainMenu.vue'
import {useTheme} from '@/composables/useTheme'

const {initTheme} = useTheme()
initTheme()
</script>

<template>
	<div class="min-w-screen min-h-screen grid grid-cols-[auto_1fr]">
		<AppMainMenu />
		<div class="h-screen overflow-y-auto scrollable">
			<RouterView />
		</div>
	</div>
</template>

<style scoped></style>
