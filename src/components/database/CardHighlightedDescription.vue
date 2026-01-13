<script lang="ts" setup>
const props = defineProps<{
	description: string
	frameType?: string
	displayLinks?: boolean
}>()
const emit = defineEmits<{
	(e: 'linkClick', text: string): void
}>()

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

// Marker system to avoid HTML escaping issues
const MARKERS = {
	SECTION_START: '\x00SEC_S\x00',
	SECTION_END: '\x00SEC_E\x00',
	SUMMON_START: '\x00SUM_S\x00',
	SUMMON_END: '\x00SUM_E\x00',
	COST_START: '\x00COST_S\x00',
	COST_END: '\x00COST_E\x00',
	QUICK_START: '\x00QUICK_S\x00',
	QUICK_END: '\x00QUICK_E\x00',
	LINK_START: '\x00LINK_S\x00',
	LINK_MID: '\x00LINK_M\x00',
	LINK_END: '\x00LINK_E\x00',
}

function getDescriptionWithHighlights(): string {
	let description = props.description
	description = description.replace(/[^\n]\●/g, '\n\●')

	// 1. Highlight Pendulum Effect section headers
	description = description.replace(
		/\[ (Pendulum Effect|Monster Effect) \]/g,
		`${MARKERS.SECTION_START}[ $1 ]${MARKERS.SECTION_END}`
	)

	// 2. Highlight summoning materials for Extra Deck monsters
	const isPendulumExtra =
		props.frameType &&
		['fusion_pendulum', 'synchro_pendulum', 'xyz_pendulum'].includes(props.frameType)
	const isRegularExtra =
		props.frameType && ['fusion', 'synchro', 'xyz', 'link'].includes(props.frameType)

	if (isPendulumExtra) {
		// For Pendulum Extra Deck monsters: summoning materials come after [ Monster Effect ]
		description = description.replace(
			/(\[ Monster Effect \][^\n]*\n)([^\n]+)/,
			`$1${MARKERS.SUMMON_START}$2${MARKERS.SUMMON_END}`
		)
	} else if (isRegularExtra) {
		// For regular Extra Deck monsters: first line is summoning materials
		description = description.replace(
			/^([^\n]+)/,
			`${MARKERS.SUMMON_START}$1${MARKERS.SUMMON_END}`
		)
	}

	// 3. Highlight cost sentences (sentences ending with : or ;)
	description = description.replace(
		/(^|[.!?\n])([^.!?\n:;\x00]*?[:;])/g,
		`$1${MARKERS.COST_START}$2${MARKERS.COST_END}`
	)

	// 4. Highlight (Quick Effect)
	description = description.replace(
		/\(Quick Effect\)/g,
		`${MARKERS.QUICK_START}(Quick Effect)${MARKERS.QUICK_END}`
	)

	// 5. Replace quoted text with clickable links (before escaping)
	description = description.replace(/"([^"]+)"/g, (_, quotedText) => {
		return `"${MARKERS.LINK_START}${quotedText}${MARKERS.LINK_MID}${quotedText}${MARKERS.LINK_END}"`
	})

	description = escapeHtml(description)
	description = description
		.replace(new RegExp(MARKERS.SECTION_START, 'g'), '<span class="desc-section-header">')
		.replace(new RegExp(MARKERS.SECTION_END, 'g'), '</span>')
		.replace(new RegExp(MARKERS.SUMMON_START, 'g'), '<span class="desc-summon-material">')
		.replace(new RegExp(MARKERS.SUMMON_END, 'g'), '</span>')
		.replace(new RegExp(MARKERS.QUICK_START, 'g'), '<span class="desc-quick-effect">')
		.replace(new RegExp(MARKERS.QUICK_END, 'g'), '</span>')
		.replace(new RegExp(MARKERS.COST_START, 'g'), '<span class="desc-cost">')
		.replace(new RegExp(MARKERS.COST_END, 'g'), '</span>')

	if (props.displayLinks)
		description = description
			.replace(
				new RegExp(
					`${MARKERS.LINK_START}([^${MARKERS.LINK_MID[0]}]+)${MARKERS.LINK_MID}`,
					'g'
				),
				'<a href="javascript:void(0)" class="desc-card-link" data-card-name="$1">'
			)
			.replace(new RegExp(MARKERS.LINK_END, 'g'), '</a>')
	else
		description = description
			.replace(
				new RegExp(
					`${MARKERS.LINK_START}([^${MARKERS.LINK_MID[0]}]+)${MARKERS.LINK_MID}`,
					'g'
				),
				'<span class="desc-card-quote">'
			)
			.replace(new RegExp(MARKERS.LINK_END, 'g'), '</span>')

	description = description
		.replace(/\[ Monster Effect \]/g, 'Monster Effect')
		.replace(/\[ Pendulum Effect \]/g, 'Pendulum Effect')

	return description
}

function onDescriptionClick(event: MouseEvent) {
	const target = event.target as HTMLElement
	if (target.tagName === 'A' && target.classList.contains('desc-card-link')) {
		event.preventDefault()
		const cardName = target.getAttribute('data-card-name')
		if (cardName) {
			emit('linkClick', cardName)
		}
	}
}
</script>

<template>
	<div
		class="desc-container leading-relaxed whitespace-pre-line font-semibold text-contrast-600 text-sm"
		v-html="getDescriptionWithHighlights()"
		@click="onDescriptionClick"
	></div>
</template>

<style lang="scss" scoped>
.desc-container {
	:deep(.desc-section-header) {
		display: inline-block;
		width: 100%;
		text-align: center;
		color: var(--color-accent-300);
		font-weight: bold;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid color-mix(in srgb, var(--color-accent-500) 30%, transparent);
		margin: 0.25rem 0;
	}

	:deep(.desc-summon-material) {
		display: inline-block;
		background: color-mix(in srgb, var(--color-tertiary-600) 10%, transparent);
		color: var(--color-tertiary-200);
		padding: 0.125rem 0.25rem 0.125rem 0.5rem;
		border-radius: 0.25rem;
		border-left: 3px solid var(--color-tertiary-400);
		margin: 0.5rem;
	}

	:deep(.desc-cost) {
		display: block;
		background: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
		padding: 0.0625rem 0.25rem;
		border-radius: 0.25rem;
		font-weight: bold;
		margin-top: 0.25rem;
	}

	:deep(.desc-quick-effect) {
		color: var(--color-secondary-400);
		font-weight: bold;
	}

	:deep(.desc-card-link) {
		color: var(--color-accent-100);
		border-bottom: 1px dashed var(--color-primary-400);
		transition: color 0.15s ease;
		cursor: pointer;

		&:hover {
			color: var(--color-accent-300);
		}
	}

	:deep(.desc-card-quote) {
		color: var(--color-accent-100);
		border-bottom: 1px dashed var(--color-primary-400);
	}
}
</style>
