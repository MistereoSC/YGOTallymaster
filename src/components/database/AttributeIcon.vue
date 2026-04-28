<script lang="ts" setup>
import {TMonsterAttribute, TSpellTrapAttribute} from '@/libs/interfaces/YGOProInterfaces'
interface IProps {
	attribute: TMonsterAttribute | TSpellTrapAttribute | string
	size?: 'tiny' | 'small' | 'normal' | 'large'
	hideTooltip?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'normal',
})
function getAttributeIconPath(attribute: TMonsterAttribute | TSpellTrapAttribute | string): string {
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

		case 'Quick-Play':
			return 'assets/icons/spelltype/Quick-Play.svg'
		case 'Continuous':
			return 'assets/icons/spelltype/Continuous.svg'
		case 'Equip':
			return 'assets/icons/spelltype/Equip.svg'
		case 'Field':
			return 'assets/icons/spelltype/Field.svg'
		case 'Ritual':
			return 'assets/icons/spelltype/Ritual.svg'
		case 'Counter':
			return 'assets/icons/spelltype/Counter.svg'
		case 'Normal':
			return 'assets/icons/spelltype/Normal.svg'
		default:
			return ''
	}
}
</script>

<template>
	<div v-tooltip.bottom="props.hideTooltip ? undefined : props.attribute">
		<img
			v-if="getAttributeIconPath(props.attribute)"
			:src="getAttributeIconPath(props.attribute)"
			:alt="props.attribute + ' Attribute'"
			:class="{
				'w-5 h-5': props.size === 'tiny',
				'w-6 h-6': props.size === 'small',
				'w-8 h-8': props.size === 'normal',
				'w-12 h-12': props.size === 'large',
			}"
		/>
		<span v-else>[{{ props.attribute }}]</span>
	</div>
</template>

<style lang="scss" scoped></style>
