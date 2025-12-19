<script lang="ts" setup>
import {useExternalLinks} from '@/composables/useExternalLinks'
import {Icon} from '@iconify/vue'

interface IProps {
	url: string
	message: string
	showExternalIcon?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
	showExternalIcon: true,
})
const {createLinkHandler} = useExternalLinks()
const handleLinkClick = createLinkHandler(props.url)
</script>

<template>
	<a
		class="hover:text-accent-500 transition-colors inline-flex gap-px items-center"
		href="#"
		@click="handleLinkClick"
	>
		<span class="underline">{{ message }}</span>
		<Icon
			class="text-gray-400!"
			icon="material-symbols:open-in-new"
			v-if="props.showExternalIcon"
		/>
	</a>
</template>

<style lang="scss" scoped></style>
