<script lang="ts" setup>
import {useExternalLinks} from '@/composables/useExternalLinks'

const {createLinkHandler} = useExternalLinks()
const handleYGOProDeckClick = createLinkHandler('https://db.ygoprodeck.com')
</script>

<template>
	<div>Hello World</div>
	<a href="#" @click="handleYGOProDeckClick"> Visit YGOProDeck </a>
</template>

<style lang="scss" scoped></style>
