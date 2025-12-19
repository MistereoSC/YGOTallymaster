<script lang="ts" setup>
import {TLinkMarkers} from '@/libs/interfaces/YGOProInterfaces'

const props = defineProps<{
	links: TLinkMarkers[]
}>()
</script>

<template>
	<div>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Top-Left'),
			}"
			class="absolute -top-3 -left-6 -rotate-45 border-black border-l-transparent! border-r-transparent! border-28 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Top'),
			}"
			class="absolute -top-6 right-[calc(50%-32px)] border-black border-l-transparent! border-r-transparent! border-32 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Top-Right'),
			}"
			class="absolute -top-3 -right-6 rotate-45 border-black border-l-transparent! border-r-transparent! border-28 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Left'),
			}"
			class="absolute top-[calc(50%-32px)] -left-10 -rotate-90 border-black border-l-transparent! border-r-transparent! border-32 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Right'),
			}"
			class="absolute top-[calc(50%-32px)] -right-10 rotate-90 border-black border-l-transparent! border-r-transparent! border-32 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Bottom'),
			}"
			class="absolute -bottom-6 right-[calc(50%-32px)] rotate-180 border-black border-l-transparent! border-r-transparent! border-32 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Bottom-Left'),
			}"
			class="absolute -bottom-3 -left-6 -rotate-135 border-black border-l-transparent! border-r-transparent! border-28 border-t-0"
		/>
		<i
			:class="{
				'border-accent-300!': props.links.includes('Bottom-Right'),
			}"
			class="absolute -bottom-3 -right-6 rotate-135 border-black border-l-transparent! border-r-transparent! border-28 border-t-0"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
