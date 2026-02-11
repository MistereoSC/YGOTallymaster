<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import {ref, onMounted, onUnmounted} from 'vue'

const props = defineProps<{
	open: boolean
}>()

const emit = defineEmits<{
	(e: 'close'): void
}>()

const isFlipping = ref(false)
const flipRotation = ref(0)

function flipCoin() {
	if (isFlipping.value) return

	isFlipping.value = true

	// Determine result randomly
	const newResult = Math.random() < 0.5 ? 'heads' : 'tails'

	// Calculate rotation: always add to current rotation for forward spin
	// At least 4 half-rotations (2 full spins) + random extra + final position
	const minHalfRotations = 4
	const extraHalfRotations = Math.floor(Math.random() * 4) // 0-3 extra
	const totalHalfRotations = minHalfRotations + extraHalfRotations

	// Heads shows at 0, 360, 720... (even multiples of 180)
	// Tails shows at 180, 540, 900... (odd multiples of 180)
	const finalOffset = newResult === 'heads' ? 0 : 180
	flipRotation.value += totalHalfRotations * 180 + finalOffset

	// Show result after animation
	setTimeout(() => {
		isFlipping.value = false
	}, 1500)
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.open) {
		emit('close')
	}
}

onMounted(() => {
	window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="props.open"
				class="fixed inset-0 bg-primary-900/90 z-200 grid place-items-center backdrop-blur-sm"
				@click.self="emit('close')"
			>
				<div
					class="w-full max-w-sm bg-primary-800 p-6 rounded-xl border border-primary-600 shadow-2xl"
				>
					<h2 class="text-lg font-semibold text-contrast-700 mb-6 text-center">
						Flip a Coin
					</h2>

					<!-- Coin Container -->
					<div class="flex justify-center mb-6">
						<div class="coin-container perspective-500">
							<div
								class="coin"
								:class="{'is-flipping': isFlipping}"
								:style="{transform: `rotateY(${flipRotation}deg)`}"
							>
								<!-- Heads side -->
								<div
									class="coin-face coin-heads bg-linear-to-br from-yellow-400 to-yellow-600"
								>
									<span class="text-2xl font-bold text-yellow-900">Heads</span>
								</div>
								<!-- Tails side -->
								<div
									class="coin-face coin-tails bg-linear-to-br from-yellow-500 to-yellow-700"
								>
									<span class="text-2xl font-bold text-yellow-900">Tails</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Buttons -->
					<div class="flex justify-center gap-3">
						<Button label="Close" size="small" @click="emit('close')" />
						<Button
							:label="isFlipping ? 'Flipping...' : 'Flip Coin'"
							size="small"
							:disabled="isFlipping"
							@click="flipCoin"
						/>
					</div>
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

.perspective-500 {
	perspective: 500px;
}

.coin-container {
	width: 100px;
	height: 100px;
}

.coin {
	width: 100%;
	height: 100%;
	position: relative;
	transform-style: preserve-3d;
	transition: transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.coin.is-flipping {
	transition: transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.coin-face {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	backface-visibility: hidden;
	border: 4px solid rgba(0, 0, 0, 0.2);
	box-shadow:
		inset 0 2px 10px rgba(255, 255, 255, 0.3),
		0 4px 15px rgba(0, 0, 0, 0.3);
}

.coin-heads {
	transform: rotateY(0deg);
}

.coin-tails {
	transform: rotateY(180deg);
}
</style>
