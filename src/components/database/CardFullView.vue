<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {TCardData} from '../../libs/interfaces/YGOProInterfaces'
import {getCardStyles} from '../../libs/CardData'
import CardReImage from './CardReImage.vue'
import {Icon} from '@iconify/vue'

const props = defineProps<{
	card: TCardData
}>()
const emit = defineEmits([])
const styles = ref(getCardStyles(props.card))
onMounted(() => {
	console.log(styles)
})
watch(
	() => props.card.id,
	() => {
		styles.value = getCardStyles(props.card)
	}
)
</script>

<template>
	<div class="max-w-2xl mx-auto flex flex-col gap-2">
		<div class="p-4 rounded-md bg-primary-800">
			<div class="flex justify-center w-full pt-4 pb-6">
				<CardReImage
					:card="card"
					size="cropped"
					:no-hover="true"
					class="shadow-sm shadow-black/50"
				/>
			</div>
			<div class="text-xl font-bold flex justify-between">
				<span>{{ card.name }}</span>
				<span v-if="card.attribute">[{{ card.attribute }}]</span>
				<span v-else>[{{ card.race }}]</span>
			</div>
			<div
				v-if="card.level"
				class="flex text-xl items-center gap-1 pt-2"
				:class="
					['xyz', 'xyz_pendulum'].includes(card.frameType)
						? ''
						: 'flex-row-reverse'
				"
			>
				<span v-for="n in card.level" :key="n">
					<span
						class="leading-none rounded-full w-6 h-6 grid place-items-center text-card-effecttext"
						:class="
							['xyz', 'xyz_pendulum'].includes(card.frameType)
								? 'bg-black'
								: 'bg-card-effect'
						"
					>
						<Icon icon="material-symbols:star-rounded" />
					</span>
				</span>
				<span
					class="text-contrast-500 font-semibold mb-1 text-md leading-none"
					>({{ card.level }})</span
				>
			</div>
		</div>

		<div class="rounded-md bg-primary-800 overflow-hidden">
			<div class="grid grid-cols-[auto_1fr_auto]" v-if="card.attribute">
				<div class="min-h-12">
					<div
						v-if="card.scale"
						class="flex flex-col items-center gap-1 px-4 pb-2 pt-3 bg-primary-600"
					>
						<div class="rotate-45 w-3 h-3 bg-blue-500"></div>
						<span class="font-bold">{{ card.scale }}</span>
					</div>
				</div>
				<div class="flex flex-col justify-center items-center gap-2">
					<div>
						<span v-if="card.typeline" class="font-bold px-4"
							>[{{ card.typeline.join(' / ') }}]</span
						>
					</div>
					<div class="h-full flex flex-row gap-4 px-4 pb-1 font-bold">
						<span>Atk/ {{ card.atk }}</span>
						<span v-if="card.linkval">LINK {{ card.linkval }}</span>
						<span v-else>Def/ {{ card.def }}</span>
					</div>
				</div>
				<div>
					<div
						v-if="card.scale"
						class="flex flex-col items-center gap-1 px-4 pb-2 pt-3 bg-primary-600"
					>
						<div class="rotate-45 w-3 h-3 bg-red-500"></div>
						<span class="font-bold">{{ card.scale }}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="p-4 rounded-md bg-primary-800">
			<span class="leading-relaxed whitespace-pre-line">
				{{ card.desc }}
			</span>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
