<script setup lang="ts">
import {Icon} from '@iconify/vue'
import Button from '../common/Button.vue'
import {ref, useSlots, watch, onMounted, onUnmounted, computed} from 'vue'
import {RUnsafePathCharactersRegex} from '@/libs/Files'

// Generic interface for items with a name property
export interface NamedItem {
	name: string
	[key: string]: unknown
}

const props = withDefaults(
	defineProps<{
		/** List of existing items to check for name conflicts */
		existingItems?: NamedItem[]
		/** If provided, the modal is in "rename" mode with this as the initial value */
		existingName?: string
		/** Controls whether the modal is open */
		open?: boolean
		/** The type of item being created/renamed (e.g., "Collection", "Set", "Deck") */
		itemType?: string
		/** Custom placeholder text for the input */
		placeholder?: string
		/** Custom error message when name already exists */
		existsErrorMessage?: string
		/** Custom description for create mode */
		createDescription?: string
		/** Custom description for rename mode */
		renameDescription?: string
		/** Icon for the confirm button */
		confirmIcon?: string
		/** Custom label for create button */
		createLabel?: string
		/** Custom label for rename button */
		renameLabel?: string
	}>(),
	{
		itemType: 'Item',
		confirmIcon: 'material-symbols:check-rounded',
	}
)

const slots = useSlots()

const internalOpen = ref(props.open ?? false)

// Computed texts based on props
const isRenameMode = computed(() => !!props.existingName)

const modalTitle = computed(() => {
	return isRenameMode.value ? `Rename ${props.itemType}` : `Create ${props.itemType}`
})

const inputPlaceholder = computed(() => {
	return props.placeholder || `${props.itemType} Name`
})

const errorMessage = computed(() => {
	return (
		props.existsErrorMessage ||
		`A ${props.itemType.toLowerCase()} with this name already exists.`
	)
})

const description = computed(() => {
	if (isRenameMode.value) {
		return props.renameDescription || `Enter a new name for your ${props.itemType}.`
	}
	return props.createDescription || `Enter a name for your new ${props.itemType}.`
})

const confirmButtonLabel = computed(() => {
	if (isRenameMode.value) {
		return props.renameLabel || 'Rename'
	}
	return props.createLabel || 'Create'
})

const confirmButtonIcon = computed(() => {
	if (isRenameMode.value) {
		return 'material-symbols:edit-rounded'
	}
	return props.confirmIcon
})

// Sync internal state when prop changes
watch(
	() => props.open,
	(newVal) => {
		if (newVal !== undefined) {
			internalOpen.value = newVal
			if (newVal) {
				nameInput.value = props.existingName || ''
				nameExistsError.value = false
			}
		}
	}
)

const nameExistsError = ref(false)
const nameInput = ref('')

function onNameInput(event: Event) {
	const input = event.target as HTMLInputElement
	const sanitized = input.value.replace(RUnsafePathCharactersRegex, '')
	if (sanitized !== input.value) {
		nameInput.value = sanitized
		input.value = sanitized
	}
}

const emit = defineEmits<{
	(e: 'confirm', newName: string): void
	(e: 'update:open', open: boolean): void
	(e: 'close'): void
}>()

function handleConfirm() {
	emit('confirm', nameInput.value.trim())
	onOpenChange(false)
}

function onOpenChange(open: boolean) {
	internalOpen.value = open
	emit('update:open', open)
	if (open) {
		nameInput.value = props.existingName || ''
		nameExistsError.value = false
	} else {
		emit('close')
	}
}

// Handle Escape key to close
function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && internalOpen.value) {
		onOpenChange(false)
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydown)
})

watch(
	() => nameInput.value,
	(newVal) => {
		const trimmedName = newVal.trim()
		if (!trimmedName || trimmedName.length < 1) {
			nameExistsError.value = false
			return
		}
		if (props.existingItems) {
			const exists = props.existingItems.some(
				(item) => item.name.toLowerCase() === trimmedName.toLowerCase()
			)
			nameExistsError.value = exists
		} else {
			nameExistsError.value = false
		}
	},
	{immediate: true}
)
</script>

<template>
	<div v-if="slots.trigger" class="w-full h-full" @click="onOpenChange(true)">
		<slot name="trigger"></slot>
	</div>

	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="internalOpen"
				class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm"
				@click.self="onOpenChange(false)"
			>
				<div
					class="relative w-full max-w-md bg-primary-800 p-5 rounded-xl border border-primary-600 shadow-2xl"
				>
					<h2 class="text-lg font-semibold text-contrast-700">
						{{ modalTitle }}
					</h2>
					<p class="mt-2 h-5 text-sm">
						<span class="text-red-400" v-if="nameExistsError">
							{{ errorMessage }}
						</span>
						<span class="text-contrast-500" v-else>
							{{ description }}
						</span>
					</p>
					<div>
						<input
							v-model="nameInput"
							v-autofocus
							type="text"
							:placeholder="inputPlaceholder"
							class="w-full mt-4 p-2.5 rounded-lg bg-primary-700 border border-primary-600 outline-none placeholder:text-contrast-400 focus:border-accent-500 transition-colors"
							@input="onNameInput"
							@keyup.enter="handleConfirm"
						/>
					</div>
					<div class="mt-5 flex justify-end">
						<Button
							:disabled="nameExistsError || nameInput.trim().length === 0"
							:icon="confirmButtonIcon"
							:label="confirmButtonLabel"
							@click="handleConfirm"
						/>
					</div>
					<button
						class="hover:bg-primary-600 cursor-pointer absolute top-3 right-3 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full transition-colors text-contrast-500 hover:text-contrast-700"
						aria-label="Close"
						@click="onOpenChange(false)"
					>
						<Icon icon="material-symbols:close-rounded" class="text-xl" />
					</button>
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
