<script lang="ts" setup>
import {TMonsterAttribute} from '@/libs/interfaces/YGOProInterfaces'
interface IProps {
	attribute: TMonsterAttribute
	size?: 'small' | 'normal' | 'large'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'normal',
})
const emit = defineEmits<{
	(e: 'click'): void
}>()

function getAttributeIconPath(attribute: TMonsterAttribute): string {
	switch (attribute) {
		case 'WIND':
			return 'assets/icons/attributes/WIND.svg'
		case 'FIRE':
			return 'assets/icons/attributes/FIRE.svg'
		case 'WATER':
			return 'assets/icons/attributes/WATER.svg'
		case 'EARTH':
			return 'assets/icons/attributes/EARTH.svg'
		case 'LIGHT':
			return 'assets/icons/attributes/LIGHT.svg'
		case 'DARK':
			return 'assets/icons/attributes/DARK.svg'
		case 'DIVINE':
			return 'assets/icons/attributes/DIVINE.svg'
		default:
			return ''
	}
}
</script>

<template>
	<div>
		<img
			:src="getAttributeIconPath(attribute)"
			:alt="props.attribute + ' Attribute'"
			:class="{
				'w-6 h-6': props.size === 'small',
				'w-8 h-8': props.size === 'normal',
				'w-12 h-12': props.size === 'large',
			}"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
