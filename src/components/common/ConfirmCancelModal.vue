<script setup lang="ts">
import Button from './Button.vue'
import {onMounted, onUnmounted} from 'vue'

const props = defineProps<{
	open: boolean
	headingText: string
	confirmText?: string
	cancelText?: string
}>()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'confirm'): void
}>()

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.open) {
		emit('cancel')
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
	<slot name="trigger" />

	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="props.open"
				class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm"
				@click.self="emit('cancel')"
			>
				<div
					class="w-full max-w-md bg-primary-800 p-5 rounded-xl border border-primary-600 shadow-2xl"
				>
					<h2 class="text-lg font-semibold text-contrast-700 mb-4">
						{{ props.headingText }}
					</h2>
					<div class="text-sm text-contrast-500 mb-5">
						<slot name="content" />
					</div>
					<div class="flex justify-end gap-3">
						<Button
							:label="props.cancelText || 'Cancel'"
							size="small"
							@click="emit('cancel')"
						/>
						<Button
							:label="props.confirmText || 'Confirm'"
							size="small"
							@click="emit('confirm')"
						/>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>
