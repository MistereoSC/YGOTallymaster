<script lang="ts" setup>
import {TBanlistFormat, TBanlistInfo, TBanlistType} from '@/libs/interfaces/YGOProInterfaces'
import {computed} from 'vue'

interface IProps {
	banlistInfo?: TBanlistInfo | TBanlistType
	showBanlistFor?: TBanlistFormat | 'none'
	size?: 'tiny' | 'small' | 'medium' | 'large'
	showTooltip?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	showBanlistFor: 'ban_tcg',
	size: 'medium',
	showTooltip: false,
})

const banlistStatus = computed(() => {
	if (!props.banlistInfo) return null
	if (props.showBanlistFor === 'none') return -1
	if (typeof props.banlistInfo === 'string') return _stringToNum(props.banlistInfo)
	if (props.banlistInfo[props.showBanlistFor] == undefined) return null
	return _stringToNum(props.banlistInfo[props.showBanlistFor]!)

	function _stringToNum(banlistType: TBanlistType): number {
		switch (banlistType) {
			case 'Forbidden':
				return 0
			case 'Limited':
				return 1
			case 'Semi-Limited':
				return 2
			default:
				return -1
		}
	}
})
const tooltipString = computed(() => {
	if (!props.showTooltip) return null
	if (!props.banlistInfo) return null
	if (props.showBanlistFor === 'none') return null
	if (typeof props.banlistInfo === 'string') return props.banlistInfo
	if (props.banlistInfo[props.showBanlistFor] == undefined) return null
	const format = props.showBanlistFor.slice(4).toUpperCase()
	return `${props.banlistInfo[props.showBanlistFor]} in ${format} Format`
})
</script>

<template>
	<div
		v-if="banlistStatus !== null && banlistStatus !== -1"
		class="select-none rounded-full bg-black border-red-500 flex items-center justify-center text-yellow-200 relative"
		:class="{
			'w-5 h-5 border-3 text-sm': props.size === 'tiny',
			'w-7 h-7 border-4 text-md': props.size === 'small',
			'w-9 h-9 border-5 text-xl': props.size === 'medium',
			'w-11 h-11 border-6 text-2xl': props.size === 'large',
			'pointer-events-none': !props.showTooltip,
		}"
		v-tooltip.bottom="tooltipString"
	>
		<div
			class="font-bold leading-none"
			v-if="banlistStatus > 0"
			:class="{
				'pb-0.5': props.size === 'small',
				'pb-0.75': props.size === 'medium',
				'pb-1': props.size === 'large',
			}"
		>
			{{ banlistStatus }}
		</div>
		<div v-else class="left-1/2 w-1 rotate-45 h-full bg-red-500"></div>
	</div>
</template>

<style lang="scss" scoped></style>
