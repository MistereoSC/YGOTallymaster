<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {onMounted, ref, watch} from 'vue'
import {useOwnedCards} from '@/composables/useOwnedCards'

const {getOwned, setOwned, initialized, ownedCards} = useOwnedCards()
interface IProps {
	cardId: number
	size?: 'small' | 'medium'
}
const props = withDefaults(defineProps<IProps>(), {
	size: 'small',
})
const emit = defineEmits<{
	(e: 'change', value: number): void
}>()
onMounted(() => {
	num.value = getOwned(props.cardId)
})
const unwatch = watch(
	() => initialized.value,
	(newVal) => {
		if (newVal === 'ready') {
			num.value = getOwned(props.cardId)
			unwatch()
		}
	}
)

const num = ref(0)
function onClickLeft(e: MouseEvent) {
	if (initialized.value !== 'ready') return
	if (e.shiftKey) {
		if (num.value >= 3) num.value++
		else num.value = 3
	} else num.value += 1

	emit('change', num.value)
	setOwned(props.cardId, num.value)
}
function onClickRight(e: MouseEvent) {
	if (initialized.value !== 'ready') return
	if (e.shiftKey) num.value = 0
	else if (num.value > 0) num.value -= 1

	emit('change', num.value)
	setOwned(props.cardId, num.value)
}

watch(
	() => ownedCards.value?.[props.cardId],
	() => {
		num.value = getOwned(props.cardId)
	}
)
</script>

<template>
	<div
		class="min-w-10 h-8 bg-black/60 rounded-tr-xl text-lg cursor-pointer select-none group/ownedHeart transition-opacity duration-300"
		:class="{
			'text-sm! h-6! min-w-8!': props.size === 'small',
			'opacity-100': num > 0,
		}"
		@click.right.stop.prevent="onClickRight"
		@click.left.stop.prevent="onClickLeft"
		v-tooltip.bottom="'Owned Cards'"
	>
		<div class="flex items-center justify-center h-full w-full pl-1 pr-2">
			<Icon
				icon="material-symbols:favorite"
				class="text-red-200 text-md mr-1 group-hover/ownedHeart:text-red-400 transition-colors"
				:class="{
					'text-xs!': props.size === 'small',
				}"
			/>
			<span class="text-contrast-900 font-mono font-bold">{{ num }}</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
