<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {onMounted, ref, watch} from 'vue'
import {useOwnedCards} from '@/composables/useOwnedCards'

const {getOwned, setOwned, initialized} = useOwnedCards()
const props = defineProps<{
	cardId: number
}>()
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
}
function onClickRight(e: MouseEvent) {
	if (initialized.value !== 'ready') return
	if (e.shiftKey) num.value = 0
	else if (num.value > 0) num.value -= 1
}

watch(num, (newVal) => {
	emit('change', newVal)
	setOwned(props.cardId, newVal)
})
</script>

<template>
	<div
		class="cardOwnHeart relative select-none cursor-pointer rounded-full text-tertiary-400 hover:text-tertiary-600 transition-colors border-none outline-none h-9 w-9 flex items-center justify-center"
		@click.right.stop.prevent="onClickRight"
		@click.left.stop.prevent="onClickLeft"
	>
		<Icon icon="tabler:heart-filled" class="text-4xl text-inherit" />
		<span
			class="absolute left-0 bottom-0.5 w-full h-full flex items-center justify-center text-contrast-50 font-bold"
			>{{ num }}</span
		>
	</div>
</template>

<style lang="scss" scoped></style>
