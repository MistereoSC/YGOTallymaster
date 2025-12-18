<script lang="ts" setup>
import {Icon} from '@iconify/vue'

const props = defineProps<{
	label: string
	icon?: string
	iconClass?: string
	routeName?: string
	active?: boolean
}>()
const emit = defineEmits<{
	(e: 'click'): void
}>()
</script>

<template>
	<router-link
		:to="{name: props.routeName ?? ''}"
		@click="emit('click')"
		class="appLink relative"
		:active="props.active === true"
	>
		<div
			class="font-semibold flex gap-2 items-center pl-3 h-10 hover:bg-primary-800 transition-colors 0.2s mr-2 ease rounded-tr-md rounded-br-md"
		>
			<Icon
				v-if="props.icon"
				:icon="props.icon"
				class="text-2xl text-contrast-500 transition-colors"
				:class="`${props.iconClass ?? ''}`"
			/>
			<span>{{ props.label }}</span>
		</div>
	</router-link>
</template>

<style lang="scss" scoped>
.appLink {
	&::before {
		content: '';
		position: absolute;
		transition: top 0.1s linear, bottom 0.1s linear,
			background-color 0.2s linear;
		left: 0;
		top: 50%;
		bottom: 50%;
		height: auto;
		width: 5px;
		background-color: var(--color-accent-400);
		border-radius: 0 5px 5px 0;
	}
	&:hover {
		&::before {
			top: 12px;
			bottom: 12px;
		}
	}

	&[active='true'] {
		&::before {
			top: 0;
			bottom: 0;
			background-color: var(--color-accent-500);
		}
	}
}
</style>
