<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Checkbox from '@/components/common/Checkbox.vue'
import Spinner from '@/components/common/Spinner.vue'
import {getConfig, setConfig, type TConfig, APP_VERSION} from '@/libs/Config'
import {nextTick, onMounted, ref} from 'vue'
import Path from '@/libs/Paths'
import CheckForUpdates from '@/components/settings/CheckForUpdates.vue'
import {Icon} from '@iconify/vue'
import {useDatabaseSettings} from '@/composables/useDatabaseSettings'
import SettingsSection from '@/components/settings/SettingsSection.vue'
import SettingsItem from '@/components/settings/SettingsItem.vue'
import SettingsSeparator from '@/components/settings/SettingsSeparator.vue'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import {useRouter} from 'vue-router'
import {invalidateUseCardSearch} from '@/composables/useCardSearch'

const router = useRouter()
const SHOW_DEBUG_SETTINGS = false

const config = ref<null | TConfig>(null)
const autoUpdateChecked = ref(false)
onMounted(async () => {
	config.value = await getConfig()
	autoUpdateChecked.value = config.value!.autoUpdate
})

// ------------------------------------------------------
// #region Display Settings
// -----------------------------------------------------
const {settings, set, toggle} = useDatabaseSettings()

enum EListSize {
	'tiny' = 'Tiny',
	'small' = 'Small',
	'medium' = 'Medium',
	'large' = 'Large',
}
enum EListSizeNoLarge {
	'tiny' = 'Small',
	'small' = 'Large',
}
enum EListSizeNoTiny {
	'small' = 'Small',
	'medium' = 'Large',
}

enum EBanlistFormat {
	'none' = 'None',
	'ban_tcg' = 'TCG',
	'ban_ocg' = 'OCG',
	'ban_goat' = 'GOAT',
}
enum ELanguageCodes {
	'en' = 'English (en)',
	'de' = 'German (de)',
	'fr' = 'French (fr)',
	'it' = 'Italian (it)',
	'pt' = 'Portuguese (pt)',
}
enum ECardPriceVendors {
	'none' = 'None',
	'cardmarket_price' = 'Cardmarket',
	'tcgplayer_price' = 'TCGPlayer',
}
// #endregion
// ------------------------------------------------------
// #region Update Settings
// ------------------------------------------------------
const checkForUpdatesModalOpen = ref(false)
const forceReset = ref(null as null | 'completeReset' | 'reInit')

function onAutoUpdateChange() {
	if (!config.value) return
	autoUpdateChecked.value = !autoUpdateChecked.value
	config.value.autoUpdate = autoUpdateChecked.value
	setConfig(config.value)
}

async function onOpenFolder() {
	const pathResult = await Path.AppRoot()
	if (pathResult) {
		await window.electronShell.openPath(pathResult)
	}
}

function onUpdateModalClose() {
	checkForUpdatesModalOpen.value = false
	forceReset.value = null
}
function onForceReset() {
	forceReset.value = 'completeReset'
	nextTick(() => {
		checkForUpdatesModalOpen.value = true
	})
}

function onLanguageChange(language: keyof typeof ELanguageCodes) {
	set.cardLanguage(language)
	forceReset.value = 'reInit'
	nextTick(() => {
		checkForUpdatesModalOpen.value = true
	})
}

function onEnglishNameSearchChange() {
	toggle.englishNameSearch()
	invalidateUseCardSearch()
}

// #endregion
// ------------------------------------------------------
</script>

<template>
	<div class="relative h-full w-full overflow-x-hidden overflow-y-auto scrollable">
		<div class="max-w-3xl mx-auto p-6 flex flex-col gap-6">
			<!-- Page Header -->
			<div class="pb-2 border-b border-primary-600">
				<h1 class="text-2xl font-bold text-contrast-800 flex items-center gap-3">
					<Icon icon="material-symbols:settings-rounded" class="text-accent-500" />
					Settings
				</h1>
				<p class="text-contrast-500 mt-1">Manage your application preferences</p>
			</div>

			<!-- Loading State -->
			<div v-if="!config" class="w-full h-64 flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<Spinner />
					<span class="text-contrast-500">Loading settings...</span>
				</div>
			</div>

			<template v-else>
				<SettingsSection
					icon="material-symbols:display-settings-outline-rounded"
					title="Display Settings"
					description="Configure how cards are displayed"
				>
					<!-- Banlist Format -->
					<SettingsItem
						icon="material-symbols:block-outline"
						iconColorClass="text-red-400"
						title="Banlist Format"
						description="Show ban status indicators for selected format"
					>
						<select
							:value="settings?.showBanlistFor"
							@change="
								(e) =>
									set.showBanlistFor(
										(e.target as HTMLSelectElement)
											.value as keyof typeof EBanlistFormat
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option v-for="(label, key) in EBanlistFormat" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
					</SettingsItem>

					<!-- Card Language -->
					<SettingsItem
						icon="material-symbols:language"
						iconColorClass="text-secondary-400"
						title="Card Language"
						description="Language only affects card names and descriptions. Card images are only available in English. Changing language may require downloading additional data."
					>
						<select
							:value="settings?.cardLanguage"
							@change="
								(e) =>
									onLanguageChange(
										(e.target as HTMLSelectElement)
											.value as keyof typeof ELanguageCodes
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option v-for="(label, key) in ELanguageCodes" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
					</SettingsItem>
					<!-- English Name Search -->
					<SettingsItem
						icon="material-symbols:language"
						title="English Name Search"
						description="Include english card names when searching in other languages"
					>
						<Checkbox
							:model-value="settings?.englishNameSearch"
							@change="onEnglishNameSearchChange"
						/>
					</SettingsItem>
					<!-- Description Highlighting -->
					<SettingsItem
						icon="material-symbols:credit-card"
						title="Description Highlighting"
						description="Highlight keywords in card descriptions for better readability (Works best for English)"
					>
						<Checkbox
							:model-value="settings?.descriptionHighlighting"
							@change="toggle.descriptionHighlighting"
						/>
					</SettingsItem>

					<SettingsSeparator label="Owned Cards" icon="tabler:heart-filled" />
					<!-- Database Owned Numbers -->
					<SettingsItem
						icon="material-symbols:tag-rounded"
						iconColorClass="text-secondary-400"
						title="Always Show Owned Numbers"
						description="Display ownership count on all cards in Database, Archetypes and Releases tabs"
					>
						<Checkbox
							:model-value="settings?.showOwnedNumbers"
							@change="toggle.showOwnedNumbers"
						/>
					</SettingsItem>
					<!-- Dim Unowned Cards (Database) -->
					<SettingsItem
						icon="material-symbols:opacity"
						iconColorClass="text-primary-300"
						title="Dim Unowned Cards (Database)"
						description="Dim cards you don't own. Affects the Database, Archetypes and Releases tabs"
					>
						<Checkbox
							:model-value="settings?.grayUnowned"
							@change="toggle.grayUnowned"
						/>
					</SettingsItem>
					<!-- Dim Unowned Cards (Small Lists) -->
					<SettingsItem
						icon="material-symbols:format-list-bulleted"
						iconColorClass="text-primary-300"
						title="Dim Unowned Cards (Small Lists)"
						description="Dim unowned cards in small lists for Deck-Creation and Set-Creation"
					>
						<Checkbox
							:model-value="settings?.grayUnownedSmallList"
							@change="toggle.grayUnownedSmallList"
						/>
					</SettingsItem>
					<!-- Dim Unowned Cards (Decks) -->
					<SettingsItem
						icon="material-symbols:opacity"
						iconColorClass="text-primary-300"
						title="Dim Unowned Cards (Decks)"
						description="Dim cards you don't own. Only affects the Decks tab"
					>
						<Checkbox
							:model-value="settings?.decklistGrayUnownedGrid"
							@change="toggle.decklistGrayUnownedGrid"
						/>
					</SettingsItem>
					<!-- Dim Unowned Cards (Sets) -->
					<SettingsItem
						icon="material-symbols:opacity"
						iconColorClass="text-primary-300"
						title="Dim Unowned Cards (Sets)"
						description="Dim cards you don't own. Only affects the Lists tab"
					>
						<Checkbox
							:model-value="settings?.setsGrayUnownedGrid"
							@change="toggle.setsGrayUnownedGrid"
						/>
					</SettingsItem>

					<SettingsSeparator label="Database " icon="material-symbols:database" />

					<!-- Database As List -->
					<SettingsItem
						icon="material-symbols:view-list-rounded"
						title="Display as List"
						iconColorClass="text-tertiary-400"
						description="Show cards in a list view instead of a grid for the Database and Archetypes tabs"
					>
						<Checkbox
							:model-value="settings?.displayAsList"
							@change="toggle.displayAsList"
						/>
					</SettingsItem>
					<!-- Database Grid Size -->
					<SettingsItem
						icon="material-symbols:photo-size-select-large-rounded"
						iconColorClass="text-tertiary-400"
						title="Card Size"
						description="Size of cards displayed in Lists, Database and Archetypes tabs"
					>
						<select
							:value="settings?.gridSize"
							@change="
								(e) =>
									set.gridSize(
										(e.target as HTMLSelectElement)
											.value as keyof typeof EListSizeNoTiny
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option v-for="(label, key) in EListSizeNoTiny" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
					</SettingsItem>
					<!-- Database List Size -->
					<SettingsItem
						icon="material-symbols:format-size-rounded"
						iconColorClass="text-tertiary-400"
						title="List Size"
						description="Size of items when displayed as a list within Lists, Database and Archetypes tabs"
					>
						<select
							:value="settings?.listSize"
							@change="
								(e) =>
									set.listSize(
										(e.target as HTMLSelectElement)
											.value as keyof typeof EListSize
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option v-for="(label, key) in EListSize" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
					</SettingsItem>
					<!-- Card Prices -->
					<SettingsItem
						icon="material-symbols:photo-size-select-large-rounded"
						iconColorClass="text-tertiary-400"
						title="Show Card Prices From"
						description="Select the vendor to show card prices from. 
									Shows estimated price (in USD) in the Card Details. 
									Sums up prices in Decks and Sets views."
					>
						<select
							:value="settings?.cardPricesVendor"
							@change="
								(e) =>
									set.cardPricesVendor(
										(e.target as HTMLSelectElement)
											.value as keyof typeof ECardPriceVendors
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option
								v-for="(label, key) in ECardPriceVendors"
								:key="key"
								:value="key"
							>
								{{ label }}
							</option>
						</select>
					</SettingsItem>

					<SettingsSeparator
						label="Decks & Lists"
						icon="material-symbols:stacks-rounded"
					/>
					<!-- List Size (Small List) -->
					<SettingsItem
						icon="material-symbols:format-size-rounded"
						iconColorClass="text-tertiary-400"
						title="Small List Size"
						description="Size of the small list on the right side of the Decks and Lists tab"
					>
						<select
							:value="settings?.listSizeSmallList"
							@change="
								(e) =>
									set.listSizeSmallList(
										(e.target as HTMLSelectElement)
											.value as keyof typeof EListSizeNoLarge
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option
								v-for="(label, key) in EListSizeNoLarge"
								:key="key"
								:value="key"
							>
								{{ label }}
							</option>
						</select>
					</SettingsItem>

					<!-- Deck Card Size -->
					<SettingsItem
						icon="material-symbols:photo-size-select-large-rounded"
						iconColorClass="text-tertiary-400"
						title="Decks Card Size"
						description="Size of cards for the Decks tab"
					>
						<select
							:value="settings?.decklistGridCardSize"
							@change="
								(e) =>
									set.decklistGridSize(
										(e.target as HTMLSelectElement)
											.value as keyof typeof EListSizeNoLarge
									)
							"
							class="cursor-pointer bg-primary-700 border border-primary-600 rounded-md px-2 py-1 focus:outline-none focus:border-accent-500"
						>
							<option
								v-for="(label, key) in EListSizeNoLarge"
								:key="key"
								:value="key"
							>
								{{ label }}
							</option>
						</select>
					</SettingsItem>
					<!-- Lists Display as List -->
					<SettingsItem
						icon="material-symbols:view-list-rounded"
						iconColorClass="text-tertiary-400"
						title="Sets as List"
						description="Show cards in a list view instead of a grid. Only affects Lists tab"
					>
						<Checkbox
							:model-value="settings?.setsDisplayAsList"
							@change="toggle.setsDisplayAsList"
						/>
					</SettingsItem>
				</SettingsSection>

				<!-- Appearance Section -->
				<SettingsSection
					icon="material-symbols:palette"
					iconColorClass="text-accent-400"
					title="Appearance"
					description="Customize the look and feel of the application"
				>
					<SettingsItem
						icon="material-symbols:colors-rounded"
						iconColorClass="text-accent-400"
						title="Color Theme"
						description="Choose a color theme for the application"
					>
						<ThemeSwitcher />
					</SettingsItem>

					<!-- Debug: Theme Preview (subtle) -->
					<div
						v-if="SHOW_DEBUG_SETTINGS"
						class="flex items-center justify-between px-3 bg-primary-900 rounded-md py-2 text-xs text-contrast-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
						@click="router.push('/debug/theme-preview')"
					>
						<span class="flex items-center gap-2">
							<Icon icon="material-symbols:bug-report-rounded" class="text-sm" />
							Theme Preview (Debug)
						</span>
						<Icon icon="material-symbols:arrow-forward-rounded" class="text-sm" />
					</div>
				</SettingsSection>

				<!-- Database & Updates Section -->
				<SettingsSection
					icon="material-symbols:cloud-sync-rounded"
					title="Database & Updates"
					description="Manage database updates and synchronization"
				>
					<!-- Auto Update Toggle -->
					<SettingsItem
						icon="material-symbols:sync-rounded"
						icon-color-class="text-secondary-400"
						title="Automatic Update Check"
						description="Check for database updates when the application starts"
					>
						<Checkbox @change="onAutoUpdateChange" :model-value="autoUpdateChecked" />
					</SettingsItem>

					<!-- Manual Update Check -->
					<SettingsItem
						icon="material-symbols:cloud-download-rounded"
						title="Check for Updates"
						description="Manually check for YGOProDeck database updates"
					>
						<Button
							label="Check Now"
							size="small"
							@click="checkForUpdatesModalOpen = true"
						/>
					</SettingsItem>
					<!-- DEBUG::: Force Reset -->
					<SettingsItem
						v-if="SHOW_DEBUG_SETTINGS"
						icon="material-symbols:cloud-download-rounded"
						title="Reset Database"
						icon-color-class="text-red-400"
						description="Force a fresh database download. Settings, images and user content are preserved."
					>
						<Button
							label="Force Reset"
							size="small"
							variant="tertiary"
							@click="onForceReset"
						/>
					</SettingsItem>
				</SettingsSection>

				<!-- Application Section -->
				<SettingsSection
					icon="material-symbols:folder-open-rounded"
					title="Application"
					description="Application data and storage settings"
				>
					<SettingsItem
						icon="material-symbols:folder-data-rounded"
						title="Application Data"
						description="Open the folder containing app data, images, and configurations"
					>
						<Button label="Open Folder" size="small" @click="onOpenFolder" />
					</SettingsItem>
				</SettingsSection>

				<!-- App Info -->
				<div class="text-center text-contrast-400 text-sm pt-2">
					<p>YGO Tallymaster • v{{ APP_VERSION }}</p>
				</div>
			</template>
		</div>
	</div>

	<!-- Modals -->
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="checkForUpdatesModalOpen"
				class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm"
				@click.self="onUpdateModalClose"
			>
				<div
					class="w-full max-w-md bg-primary-800 p-5 rounded-xl border border-primary-600 shadow-2xl"
				>
					<CheckForUpdates @close="onUpdateModalClose" :force-reset="forceReset" />
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style lang="scss" scoped>
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>
