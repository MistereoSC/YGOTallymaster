<script setup lang="ts">
import {Icon} from '@iconify/vue'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from 'reka-ui'
import Button from '../common/Button.vue'
import {ref, useSlots, watch} from 'vue'
import {RUnsafePathCharactersRegex} from '@/libs/Files'
import {TFullCollection} from '@/composables/useCardCollections'
import {TCardCollection} from '@/libs/interfaces/CardSets'

const props = defineProps<{
	existingCollections?: TFullCollection[] | TCardCollection[]
	existingCollectionNameForRename?: string
	open?: boolean
}>()

const slots = useSlots()

const internalOpen = ref(props.open ?? false)

// Sync internal state when prop changes
watch(
	() => props.open,
	(newVal) => {
		if (newVal !== undefined) {
			internalOpen.value = newVal
			if (newVal) {
				nameInput.value = props.existingCollectionNameForRename || ''
				collectionExistsError.value = false
			}
		}
	}
)

const collectionExistsError = ref(false)
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
	(e: 'create', name: string): void
	(e: 'update:open', open: boolean): void
	(e: 'close'): void
}>()
function handleCreate() {
	emit('create', nameInput.value.trim())
	onOpenChange(false)
}

function onOpenChange(open: boolean) {
	internalOpen.value = open
	emit('update:open', open)
	if (open) {
		nameInput.value = ''
		collectionExistsError.value = false
	} else {
		emit('close')
	}
}

watch(
	() => nameInput.value,
	(newVal) => {
		const trimmedName = newVal.trim()
		if (!trimmedName || trimmedName.length < 1) {
			return
		}
		if (props.existingCollections) {
			const exists = props.existingCollections.some(
				(collection) => collection.name.toLowerCase() === trimmedName.toLowerCase()
			)
			collectionExistsError.value = exists
		} else {
			collectionExistsError.value = false
		}
	},
	{immediate: true}
)
</script>

<template>
	<DialogRoot v-model:open="internalOpen" @update:open="onOpenChange">
		<DialogTrigger class="w-full h-full" v-if="slots.trigger">
			<slot name="trigger"></slot>
		</DialogTrigger>
		<DialogPortal>
			<DialogOverlay
				class="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-30"
			/>
			<DialogContent
				class="p-4 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-120 translate-x-[-50%] translate-y-[-50%] rounded-md bg-primary-700 focus:outline-none z-100"
			>
				<DialogTitle class="m-0 text-xl font-semibold">
					{{ props.existingCollectionNameForRename ? 'Rename' : 'Create' }} Collection
				</DialogTitle>
				<DialogDescription class="mt-2 h-4">
					<span class="text-red-400" v-if="collectionExistsError">
						A collection with this name already exists.
					</span>
					<span class="text-contrast-500" v-else>
						<span v-if="props.existingCollectionNameForRename"
							>Enter a new name for your Collection.</span
						>
						<span v-else>Enter a name for your new Collection.</span></span
					>
				</DialogDescription>
				<div>
					<input
						v-model="nameInput"
						type="text"
						placeholder="Collection Name"
						class="w-full mt-4 p-2 rounded-md bg-primary-600 outline-none placeholder:text-contrast-500"
						@input="onNameInput"
					/>
				</div>
				<div class="mt-6 flex justify-end">
					<DialogClose as-child>
						<Button
							:disabled="collectionExistsError || nameInput.trim().length === 0"
							icon="material-symbols:add-2-rounded"
							:label="props.existingCollectionNameForRename ? 'Rename' : 'Create'"
							@click="handleCreate"
						/>
					</DialogClose>
				</div>
				<DialogClose
					class="hover:bg-primary-900/20 cursor-pointer absolute top-2.5 right-2.5 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full"
					aria-label="Close"
				>
					<Icon icon="material-symbols:close-rounded" />
				</DialogClose>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
