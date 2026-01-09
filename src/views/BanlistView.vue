<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import Spinner from '@/components/common/Spinner.vue'
import {getBanlist} from '@/libs/Banlist'
import CardListVirtualList from '@/components/database/CardListVirtualList.vue'
import {TBanlistFormat, TCardData} from '@/libs/interfaces/YGOProInterfaces'
import CardFullView from '@/components/database/CardFullView.vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'

const activeCard = ref<TCardData | null>(null)
const activeBanlist = ref<TBanlistFormat>('ban_tcg')
enum EBanlistFormat {
	'ban_tcg' = 'TCG',
	'ban_ocg' = 'OCG',
	'ban_goat' = 'GOAT',
}

const banlist = ref<null | Awaited<ReturnType<typeof getBanlist>>>(null)
const {settings, initialized} = useDatabaseSettings()
onMounted(async () => {})
watch(
	() => initialized.value,
	(newVal) => {
		if (newVal === 'ready') {
			activeBanlist.value =
				settings.value?.showBanlistFor && settings.value?.showBanlistFor !== 'none'
					? settings.value?.showBanlistFor
					: 'ban_tcg'
			initializeList()
		}
	},
	{immediate: true}
)

async function initializeList() {
	banlist.value = await getBanlist(activeBanlist.value)
	activeCard.value =
		banlist.value.forbidden.length > 0
			? banlist.value.forbidden[0]
			: banlist.value.limited.length > 0
			? banlist.value.limited[0]
			: banlist.value.semi_limited.length > 0
			? banlist.value.semi_limited[0]
			: null
}
async function switchBanlist(to: keyof typeof EBanlistFormat) {
	activeBanlist.value = to ?? 'ban_tcg'
	await initializeList()
}
</script>

<template>
	<div class="w-full h-full">
		<div v-if="banlist" class="h-full grid grid-rows-[auto_1fr]">
			<div
				class="h-12 w-full flex justify-between px-4 py-1 items-center bg-linear-to-r from-primary-700 to-primary-800 border-b border-primary-600"
			>
				<div class="flex gap-3 items-center">
					<div class="flex flex-col">
						<h2 class="font-semibold text-contrast-700 text-sm leading-tight">
							Banlist
						</h2>
						<p class="text-xs text-contrast-500">
							<span class="font-medium">
								{{ banlist.forbidden.length }} Forbidden |
								{{ banlist.limited.length }} Limited |
								{{ banlist.semi_limited.length }} Semi-Limited
							</span>
						</p>
					</div>
				</div>
				<div class="grid items-center gap-2">
					<select
						:value="activeBanlist"
						@change="(e) => switchBanlist((e.target as HTMLSelectElement).value as keyof typeof EBanlistFormat)"
						class="bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500 w-full"
					>
						<option v-for="(label, key) in EBanlistFormat" :key="key" :value="key">
							{{ label }}
						</option>
					</select>
				</div>
			</div>
			<div class="h-full w-full grid grid-cols-[1fr_auto] overflow-hidden">
				<CardListVirtualList
					:cardList="[...banlist.forbidden, ...banlist.limited, ...banlist.semi_limited]"
					:item-size="'small'"
					@card-clicked="(card) => (activeCard = card)"
					:active-card-id="activeCard?.id"
					:show-banlist-for="activeBanlist ?? 'ban_tcg'"
				/>
				<div
					class="border-l border-primary-600 min-w-116 w-[33vw] max-w-174 bg-primary-700 ml-1 h-full overflow-hidden"
				>
					<div class="h-full overflow-y-auto scrollable p-3">
						<CardFullView
							v-if="activeCard"
							:card="activeCard"
							:show-banlist-for="activeBanlist && 'ban_tcg'"
						/>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="w-full h-full">
			<div class="w-full h-full flex flex-col justify-center items-center">
				<Spinner />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
