import {ref} from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: string
	message: string
	type: ToastType
	duration: number
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

function generateId(): string {
	return `toast-${++toastIdCounter}-${Date.now()}`
}

export function useToast() {
	function addToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
		const id = generateId()
		const toast: Toast = {id, message, type, duration}

		toasts.value.push(toast)

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id)
			}, duration)
		}

		return id
	}

	function removeToast(id: string): void {
		const index = toasts.value.findIndex((t) => t.id === id)
		if (index !== -1) {
			toasts.value.splice(index, 1)
		}
	}

	function clearAll(): void {
		toasts.value = []
	}

	return {
		toasts,
		addToast,
		removeToast,
		clearAll,
	}
}
