import type {Directive, DirectiveBinding} from 'vue'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipState {
	element: HTMLElement | null
	showTimeout: ReturnType<typeof setTimeout> | null
	hideTimeout: ReturnType<typeof setTimeout> | null
	removeTimeout: ReturnType<typeof setTimeout> | null
}

const TOOLTIP_OFFSET = 8
const SHOW_DELAY = 100
const HIDE_DELAY = 100

// Store tooltip state per element
const tooltipStates = new WeakMap<HTMLElement, TooltipState>()

// Track all active tooltip elements for global cleanup
const activeTooltipElements = new Set<HTMLElement>()

// Global handlers for edge cases where mouseleave doesn't fire
function hideAllTooltips() {
	activeTooltipElements.forEach((el) => {
		hideTooltip(el)
	})
}

// Set up global listeners once
let globalListenersAttached = false
function attachGlobalListeners() {
	if (globalListenersAttached) return
	globalListenersAttached = true

	// Hide tooltips when window loses focus
	window.addEventListener('blur', hideAllTooltips)

	// Hide tooltips on any click (prevents stuck tooltips after navigation)
	document.addEventListener('pointerdown', hideAllTooltips, {capture: true})
}

function getPosition(modifiers: DirectiveBinding['modifiers']): TooltipPosition {
	if (modifiers.top) return 'top'
	if (modifiers.bottom) return 'bottom'
	if (modifiers.left) return 'left'
	if (modifiers.right) return 'right'
	return 'bottom' // default position
}

function createTooltipElement(content: string): HTMLElement {
	const tooltip = document.createElement('div')
	tooltip.className = 'v-tooltip'
	tooltip.textContent = content
	tooltip.setAttribute('role', 'tooltip')
	return tooltip
}

function calculatePosition(
	targetRect: DOMRect,
	tooltipRect: DOMRect,
	preferredPosition: TooltipPosition
): {top: number; left: number; finalPosition: TooltipPosition; arrowOffset: number} {
	const viewport = {
		width: window.innerWidth,
		height: window.innerHeight,
	}

	// Calculate available space in each direction
	const space = {
		top: targetRect.top,
		bottom: viewport.height - targetRect.bottom,
		left: targetRect.left,
		right: viewport.width - targetRect.right,
	}

	// Determine if preferred position fits, otherwise find best alternative
	const positionFits = (position: TooltipPosition): boolean => {
		switch (position) {
			case 'top':
				return space.top >= tooltipRect.height + TOOLTIP_OFFSET
			case 'bottom':
				return space.bottom >= tooltipRect.height + TOOLTIP_OFFSET
			case 'left':
				return space.left >= tooltipRect.width + TOOLTIP_OFFSET
			case 'right':
				return space.right >= tooltipRect.width + TOOLTIP_OFFSET
		}
	}

	// Try preferred position first, then fallbacks
	const positionOrder: TooltipPosition[] = [preferredPosition]
	const opposites: Record<TooltipPosition, TooltipPosition> = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left',
	}

	// Add opposite first, then the other two
	positionOrder.push(opposites[preferredPosition])
	if (preferredPosition === 'top' || preferredPosition === 'bottom') {
		positionOrder.push('right', 'left')
	} else {
		positionOrder.push('bottom', 'top')
	}

	let finalPosition = preferredPosition
	for (const position of positionOrder) {
		if (positionFits(position)) {
			finalPosition = position
			break
		}
	}

	// Calculate coordinates based on final position
	let top = 0
	let left = 0

	// Calculate the ideal (unclamped) position first
	let idealLeft = 0
	let idealTop = 0

	switch (finalPosition) {
		case 'top':
			top = targetRect.top - tooltipRect.height - TOOLTIP_OFFSET
			idealLeft = targetRect.left + (targetRect.width - tooltipRect.width) / 2
			left = idealLeft
			idealTop = top
			break
		case 'bottom':
			top = targetRect.bottom + TOOLTIP_OFFSET
			idealLeft = targetRect.left + (targetRect.width - tooltipRect.width) / 2
			left = idealLeft
			idealTop = top
			break
		case 'left':
			idealTop = targetRect.top + (targetRect.height - tooltipRect.height) / 2
			top = idealTop
			left = targetRect.left - tooltipRect.width - TOOLTIP_OFFSET
			idealLeft = left
			break
		case 'right':
			idealTop = targetRect.top + (targetRect.height - tooltipRect.height) / 2
			top = idealTop
			left = targetRect.right + TOOLTIP_OFFSET
			idealLeft = left
			break
	}

	// Clamp to viewport bounds with some padding
	const padding = 8
	left = Math.max(padding, Math.min(left, viewport.width - tooltipRect.width - padding))
	top = Math.max(padding, Math.min(top, viewport.height - tooltipRect.height - padding))

	// Calculate arrow offset based on how much the tooltip was shifted
	// For top/bottom positions, calculate horizontal offset
	// For left/right positions, calculate vertical offset
	let arrowOffset = 0
	if (finalPosition === 'top' || finalPosition === 'bottom') {
		// Arrow should point to the center of the target element
		// Target center relative to tooltip's left edge
		const targetCenterX = targetRect.left + targetRect.width / 2
		arrowOffset = targetCenterX - left
		// Clamp arrow offset to stay within tooltip bounds (with padding for arrow size)
		const arrowPadding = 12
		arrowOffset = Math.max(
			arrowPadding,
			Math.min(arrowOffset, tooltipRect.width - arrowPadding)
		)
	} else {
		// Arrow should point to the center of the target element
		const targetCenterY = targetRect.top + targetRect.height / 2
		arrowOffset = targetCenterY - top
		// Clamp arrow offset to stay within tooltip bounds
		const arrowPadding = 12
		arrowOffset = Math.max(
			arrowPadding,
			Math.min(arrowOffset, tooltipRect.height - arrowPadding)
		)
	}

	return {top, left, finalPosition, arrowOffset}
}

function showTooltip(el: HTMLElement, binding: DirectiveBinding) {
	const content = binding.value

	// Don't show tooltip if content is empty, null, or undefined
	if (content === null || content === undefined || content === '') {
		return
	}

	const state = tooltipStates.get(el)
	if (!state) return

	// Track this element as having an active tooltip
	activeTooltipElements.add(el)

	// Clear any pending hide timeout
	if (state.hideTimeout) {
		clearTimeout(state.hideTimeout)
		state.hideTimeout = null
	}

	// Clear any pending remove timeout
	if (state.removeTimeout) {
		clearTimeout(state.removeTimeout)
		state.removeTimeout = null
	}

	// If tooltip already exists, re-show it (it might be fading out)
	if (state.element) {
		state.element.classList.add('v-tooltip--visible')
		return
	}

	state.showTimeout = setTimeout(() => {
		// Double-check element is still in DOM
		if (!el.isConnected) return

		const tooltip = createTooltipElement(String(content))
		document.body.appendChild(tooltip)
		state.element = tooltip

		// Get positions after tooltip is in DOM (to get accurate dimensions)
		const targetRect = el.getBoundingClientRect()
		const tooltipRect = tooltip.getBoundingClientRect()
		const preferredPosition = getPosition(binding.modifiers)

		const {top, left, finalPosition, arrowOffset} = calculatePosition(
			targetRect,
			tooltipRect,
			preferredPosition
		)

		tooltip.style.top = `${top}px`
		tooltip.style.left = `${left}px`
		tooltip.style.setProperty('--arrow-offset', `${arrowOffset}px`)
		tooltip.setAttribute('data-position', finalPosition)

		// Trigger animation
		requestAnimationFrame(() => {
			tooltip.classList.add('v-tooltip--visible')
		})
	}, SHOW_DELAY)
}

function hideTooltip(el: HTMLElement) {
	const state = tooltipStates.get(el)
	if (!state) return

	// Remove from active tracking
	activeTooltipElements.delete(el)

	// Clear any pending show timeout
	if (state.showTimeout) {
		clearTimeout(state.showTimeout)
		state.showTimeout = null
	}

	if (!state.element) return

	state.hideTimeout = setTimeout(() => {
		if (state.element) {
			state.element.classList.remove('v-tooltip--visible')

			// Remove after animation
			state.removeTimeout = setTimeout(() => {
				if (state.element && state.element.parentNode) {
					state.element.parentNode.removeChild(state.element)
				}
				state.element = null
				state.removeTimeout = null
			}, 150)
		}
	}, HIDE_DELAY)
}

function destroyTooltip(el: HTMLElement) {
	const state = tooltipStates.get(el)
	if (!state) return

	// Remove from active tracking
	activeTooltipElements.delete(el)

	if (state.showTimeout) {
		clearTimeout(state.showTimeout)
	}
	if (state.hideTimeout) {
		clearTimeout(state.hideTimeout)
	}
	if (state.removeTimeout) {
		clearTimeout(state.removeTimeout)
	}
	if (state.element && state.element.parentNode) {
		state.element.parentNode.removeChild(state.element)
	}

	tooltipStates.delete(el)
}

export const vTooltip: Directive<HTMLElement, string | null | undefined> = {
	mounted(el, binding) {
		// Ensure global listeners are attached
		attachGlobalListeners()

		// Initialize state for this element
		tooltipStates.set(el, {
			element: null,
			showTimeout: null,
			hideTimeout: null,
			removeTimeout: null,
		})

		// Store the initial binding on the element
		;(el as any)._tooltipBinding = binding

		// Store handlers on element for cleanup
		// Handlers reference the stored binding so they always use the latest value
		const handlers = {
			mouseenter: () => showTooltip(el, (el as any)._tooltipBinding),
			mouseleave: () => hideTooltip(el),
			focus: () => showTooltip(el, (el as any)._tooltipBinding),
			blur: () => hideTooltip(el),
		}

		;(el as any)._tooltipHandlers = handlers

		el.addEventListener('mouseenter', handlers.mouseenter)
		el.addEventListener('mouseleave', handlers.mouseleave)
		el.addEventListener('focus', handlers.focus)
		el.addEventListener('blur', handlers.blur)
	},

	updated(el, binding) {
		// Update the stored binding for dynamic content
		;(el as any)._tooltipBinding = binding

		// If tooltip is currently visible, update its content
		const state = tooltipStates.get(el)
		if (state?.element) {
			const content = binding.value
			if (content === null || content === undefined || content === '') {
				// Hide tooltip if content becomes empty
				hideTooltip(el)
			} else {
				state.element.textContent = String(content)
			}
		}
	},

	beforeUnmount(el) {
		// Clean up tooltip when element is unmounted
		destroyTooltip(el)

		const handlers = (el as any)._tooltipHandlers
		if (handlers) {
			el.removeEventListener('mouseenter', handlers.mouseenter)
			el.removeEventListener('mouseleave', handlers.mouseleave)
			el.removeEventListener('focus', handlers.focus)
			el.removeEventListener('blur', handlers.blur)
		}
	},
}

export default vTooltip
