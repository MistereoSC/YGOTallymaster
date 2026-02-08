<script lang="ts" setup>
import {TMDRarity} from '@/libs/interfaces/YGOProInterfaces'

const props = defineProps<{
	mdRarity: TMDRarity | undefined
}>()
</script>

<template>
	<div class="w-8 h-6 select-none">
		<div
			v-if="props.mdRarity == 'Rare'"
			class="grid rounded-br-lg place-items-center bg-linear-to-br from-[#1b24c7] to-[#0180fe]"
		>
			<span class="font-bold pr-1">R</span>
		</div>
		<div
			v-else-if="props.mdRarity == 'Super Rare'"
			class="grid rounded-br-lg place-items-center bg-linear-to-br from-[#fd5800] to-[#feaf3a]"
		>
			<span class="font-bold pr-1">SR</span>
		</div>
		<div
			v-else-if="props.mdRarity == 'Ultra Rare'"
			class="grid rounded-br-lg place-items-center bg-linear-to-br from-[#b12bf8] via-[#6d65e7] to-[#3feefb]"
		>
			<span class="font-bold pr-1">UR</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
