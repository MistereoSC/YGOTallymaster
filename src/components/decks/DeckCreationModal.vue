<script setup lang="ts">
import {TDeckData} from '@/libs/Decks'
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
import {ref, watch} from 'vue'
import {RUnsafePathCharactersRegex} from '@/libs/Files'

const props = defineProps<{
	existingDecks?: TDeckData[]
}>()

const deckExistsError = ref(false)
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
}>()
function handleCreate() {
	emit('create', nameInput.value.trim())
}

function onOpenChange(open: boolean) {
	if (open) {
		nameInput.value = ''
		deckExistsError.value = false
	}
}

watch(
	() => nameInput.value,
	(newVal) => {
		const trimmedName = newVal.trim()
		if (!trimmedName || trimmedName.length < 1) {
			return
		}
		if (props.existingDecks) {
			const exists = props.existingDecks.some(
				(deck) => deck.name.toLowerCase() === trimmedName.toLowerCase()
			)
			deckExistsError.value = exists
		} else {
			deckExistsError.value = false
		}
	},
	{immediate: true}
)
</script>

<template>
	<DialogRoot @update:open="onOpenChange">
		<DialogTrigger class="w-full h-full">
			<slot name="trigger"></slot>
		</DialogTrigger>
		<DialogPortal>
			<DialogOverlay
				class="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-30"
			/>
			<DialogContent
				class="p-4 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-120 translate-x-[-50%] translate-y-[-50%] rounded-md bg-primary-700 focus:outline-none z-100"
			>
				<DialogTitle class="m-0 text-xl font-semibold"> Create Deck </DialogTitle>
				<DialogDescription class="mt-2 h-4">
					<span class="text-red-400" v-if="deckExistsError">
						A deck with this name already exists.
					</span>
					<span class="text-contrast-500" v-else>Enter a name for your new Deck.</span>
				</DialogDescription>
				<div>
					<input
						v-model="nameInput"
						type="text"
						placeholder="Deck Name"
						class="w-full mt-4 p-2 rounded-md bg-primary-600 outline-none placeholder:text-contrast-500"
						@input="onNameInput"
					/>
				</div>
				<div class="mt-6 flex justify-end">
					<DialogClose as-child>
						<Button
							:disabled="deckExistsError || nameInput.trim().length === 0"
							icon="material-symbols:add-2-rounded"
							label="Create"
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
