<script lang="ts" setup>
import {TLinkMarkers} from '@/libs/interfaces/YGOProInterfaces'
import {Icon} from '@iconify/vue'

interface IProps {
	links: TLinkMarkers[]
	size?: 'tiny' | 'small' | 'medium' | 'large'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'tiny',
})
</script>

<template>
	<div
		class="grid grid-cols-3 grid-rows-3 pb-1 pr-1"
		:class="{
			' w-7.5 h-7.5 text-lg -mt-2 -ml-1.5': props.size == 'tiny',
			' w-12 h-12 text-4xl -mt-4 -ml-3': props.size == 'small',
			' w-20 h-20 text-5xl -mt-4.5 -ml-3.5': props.size == 'medium',
			' w-24 h-24 text-5xl -mt-3.5 -ml-3': props.size == 'large',
		}"
	>
		<div
			class="grid place-items-center leading-0"
			:class="{
				'text-accent-500 ': props.links.includes('Top-Left'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="rotate-45" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Top'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="rotate-90" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Top-Right'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="rotate-135" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Left'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="rotate-0" />
		</div>
		<span></span>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Right'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="rotate-180" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Bottom-Left'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="-rotate-45" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Bottom'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="-rotate-90" />
		</div>
		<div
			:class="{
				'text-accent-500 ': props.links.includes('Bottom-Right'),
			}"
		>
			<Icon icon="material-symbols:arrow-left-rounded" class="-rotate-135" />
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
