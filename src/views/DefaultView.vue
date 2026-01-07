<script lang="ts" setup>
import {Icon} from '@iconify/vue'
</script>

<template>
	<div class="h-full w-full flex flex-col items-center justify-center">
		<Icon icon="material-symbols:chat-error-rounded" class="text-4xl text-red-500" />
		<p class="text-lg font-medium text-contrast-500">I did not expect to see you here!</p>
		<p class="text-lg font-medium text-contrast-300">
			Who knows what went wrong, better go back to safety.
		</p>
	</div>
</template>

<style lang="scss" scoped></style>
