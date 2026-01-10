<script lang="ts" setup>
import {useToast} from '@/composables/useToast'
import Toast from './Toast.vue'

const {toasts, removeToast} = useToast()

interface IProps {
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
const props = withDefaults(defineProps<IProps>(), {
	position: 'bottom-right',
})
</script>

<template>
	<Teleport to="body">
		<div
			class="fixed z-9999 flex flex-col gap-2"
			:class="{
				'top-4 left-4': props.position === 'top-left',
				'top-4 right-4': props.position === 'top-right',
				'bottom-4 left-4': props.position === 'bottom-left',
				'bottom-4 right-4': props.position === 'bottom-right',
			}"
		>
			<TransitionGroup name="toast">
				<Toast
					v-for="toast in toasts"
					:key="toast.id"
					:id="toast.id"
					:message="toast.message"
					:type="toast.type"
					:duration="toast.duration"
					@close="removeToast"
				/>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<style scoped>
.toast-enter-active {
	transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
	transition: all 0.2s ease-out;
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(100%);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

.toast-move {
	transition: transform 0.3s ease;
}
</style>
