<script lang="ts" setup>
import {Icon} from '@iconify/vue'
import {onMounted, ref, watch} from 'vue'
import {useOwnedCards} from '@/composables/useOwnedCards'

const store = useOwnedCards()
const props = defineProps<{
	cardId: number
}>()
const emit = defineEmits<{
	(e: 'change', value: number): void
}>()
onMounted(() => {
	num.value = store.getOwned(props.cardId)
})
const unwatch = watch(
	() => store.initialized.value,
	(newVal) => {
		if (newVal === 'ready') {
			num.value = store.getOwned(props.cardId)
			unwatch()
		}
	}
)

const num = ref(0)
function onMouse(e: MouseEvent) {
	if (store.initialized.value !== 'ready') return
	if (e.button === 0) {
		if (e.shiftKey) {
			// Shift + Left click
			num.value = 3
			return
		}
		// Left click
		num.value += 1
	} else if (e.button === 2) {
		if (e.shiftKey) {
			// Shift + Right click
			num.value = 0
			return
		}
		// Right click
		if (num.value > 0) {
			num.value -= 1
		}
	}
}

watch(num, (newVal) => {
	emit('change', newVal)
	store.setOwned(props.cardId, newVal)
})
</script>

<template>
	<div
		class="cardOwnHeart relative select-none cursor-pointer rounded-full p-0.5 text-tertiary-300 hover:text-tertiary-500 transition-colors border-none outline-none h-9 w-9 flex items-center justify-center"
		@mouseup.stop.prevent="(e) => onMouse(e)"
		@click.stop
	>
		<Icon icon="tabler:heart-filled" class="text-4xl text-inherit" />
		<span
			class="absolute left-0 bottom-0.5 w-full h-full flex items-center justify-center text-contrast-50 font-bold"
			>{{ num }}</span
		>
	</div>
</template>

<style lang="scss" scoped></style>
