<script lang="ts" setup>
import {TMDRarity} from '@/libs/interfaces/YGOProInterfaces'

interface IProps {
	mdRarity: TMDRarity | undefined
	size?: 'small' | 'medium'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'small',
})
</script>

<template>
	<div
		class="select-none font-bold overflow-hidden"
		:class="
			props.size === 'small'
				? 'min-w-6 text-sm rounded-br-md'
				: 'min-w-8 text-md rounded-br-lg'
		"
	>
		<div
			v-if="props.mdRarity == 'Common'"
			class="grid place-items-center bg-linear-to-br from-[#92959b] to-[#3c373f]"
		>
			<span class="ml-1 mr-2 text-center w-[2ch]">C</span>
		</div>
		<div
			v-else-if="props.mdRarity == 'Rare'"
			class="grid place-items-center bg-linear-to-br from-[#1b24c7] to-[#0180fe]"
		>
			<span class="ml-1 mr-2 text-center w-[2ch]">R</span>
		</div>
		<div
			v-else-if="props.mdRarity == 'Super Rare'"
			class="grid place-items-center bg-linear-to-br from-[#fd5800] to-[#feaf3a]"
		>
			<span class="ml-1 mr-2 text-center w-[2ch]">SR</span>
		</div>
		<div
			v-else-if="props.mdRarity == 'Ultra Rare'"
			class="grid place-items-center bg-linear-to-br from-[#b12bf8] via-[#6d65e7] to-[#3feefb]"
		>
			<span class="ml-1 mr-2 text-center w-[2ch]">UR</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
