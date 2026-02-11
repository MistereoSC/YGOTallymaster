<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import {ref, onMounted, onUnmounted} from 'vue'

const props = defineProps<{
	open: boolean
}>()

const emit = defineEmits<{
	(e: 'close'): void
}>()

const isRolling = ref(false)
const displayNumber = ref(1)
const diceRotation = ref({x: 0, y: 180, z: 0})
// const diceRotation = ref({x: 0, y: 0, z: 0})

// Die face rotations to show each number facing front
const faceRotations: Record<number, {x: number; y: number; z: number}> = {
	1: {x: 0, y: 0, z: 0}, // 1 is on front
	2: {x: 0, y: -90, z: 0}, // 2 is on right, rotate Y left to show
	3: {x: -90, y: 0, z: 0}, // 3 is on top, rotate X down to show
	4: {x: 90, y: 0, z: 0}, // 4 is on bottom, rotate X up to show
	5: {x: 0, y: 90, z: 0}, // 5 is on left, rotate Y right to show
	6: {x: 0, y: 180, z: 0}, // 6 is on back, rotate Y 180 to show
}

function rollDice() {
	if (isRolling.value) return

	isRolling.value = true

	// Determine result randomly
	const newResult = Math.floor(Math.random() * 6) + 1

	// Animate through random numbers - slower and fewer iterations
	let iterations = 0
	const maxIterations = 8
	const interval = setInterval(() => {
		displayNumber.value = Math.floor(Math.random() * 6) + 1
		// Gentler random tumbling rotation
		diceRotation.value = {
			x: Math.random() * 360 - 180,
			y: Math.random() * 360 - 180,
			z: Math.random() * 180 - 90,
		}
		iterations++

		if (iterations >= maxIterations) {
			clearInterval(interval)
			// Final position
			displayNumber.value = newResult
			const finalRotation = faceRotations[newResult]
			// Add one full spin to final position
			diceRotation.value = {
				x: finalRotation.x + 360,
				y: finalRotation.y + 360,
				z: finalRotation.z,
			}
			isRolling.value = false
		}
	}, 150)
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

// Dot patterns for each face
const dotPatterns: Record<number, number[][]> = {
	1: [[1, 1]], // center
	2: [
		[0, 0],
		[2, 2],
	], // top-left, bottom-right
	3: [
		[0, 0],
		[1, 1],
		[2, 2],
	], // diagonal
	4: [
		[0, 0],
		[0, 2],
		[2, 0],
		[2, 2],
	], // corners
	5: [
		[0, 0],
		[0, 2],
		[1, 1],
		[2, 0],
		[2, 2],
	], // corners + center
	6: [
		[0, 0],
		[1, 0],
		[2, 0],
		[0, 2],
		[1, 2],
		[2, 2],
	], // two columns
}

function getDotClass(row: number, col: number, face: number): boolean {
	return dotPatterns[face].some(([r, c]) => r === row && c === col)
}
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
						Roll a Dice
					</h2>

					<!-- Dice Container -->
					<div class="flex justify-center mb-6">
						<div class="dice-scene perspective-800">
							<div
								class="dice"
								:class="{'is-rolling': isRolling}"
								:style="{
									transform: `rotateX(${diceRotation.x}deg) rotateY(${diceRotation.y}deg) rotateZ(${diceRotation.z}deg)`,
								}"
							>
								<!-- Face 1 (front) -->
								<div class="dice-face dice-front">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f1-r' + row">
											<div
												v-for="col in 3"
												:key="'f1-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 1)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
								<!-- Face 6 (back) -->
								<div class="dice-face dice-back">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f6-r' + row">
											<div
												v-for="col in 3"
												:key="'f6-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 6)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
								<!-- Face 2 (right) -->
								<div class="dice-face dice-right">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f2-r' + row">
											<div
												v-for="col in 3"
												:key="'f2-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 2)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
								<!-- Face 5 (left) -->
								<div class="dice-face dice-left">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f5-r' + row">
											<div
												v-for="col in 3"
												:key="'f5-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 5)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
								<!-- Face 3 (top) -->
								<div class="dice-face dice-top">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f3-r' + row">
											<div
												v-for="col in 3"
												:key="'f3-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 3)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
								<!-- Face 4 (bottom) -->
								<div class="dice-face dice-bottom">
									<div class="dot-grid">
										<template v-for="row in 3" :key="'f4-r' + row">
											<div
												v-for="col in 3"
												:key="'f4-c' + col"
												class="dot-cell"
											>
												<div
													v-if="getDotClass(row - 1, col - 1, 4)"
													class="dot"
												></div>
											</div>
										</template>
									</div>
								</div>
							</div>
						</div>
					</div>

					<br />
					<!-- Buttons -->
					<div class="flex justify-center gap-3">
						<Button label="Close" size="small" @click="emit('close')" />
						<Button
							:label="isRolling ? 'Rolling...' : 'Roll Dice'"
							size="small"
							:disabled="isRolling"
							@click="rollDice"
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

.perspective-800 {
	perspective: 800px;
}

.dice-scene {
	width: 80px;
	height: 80px;
}

.dice {
	width: 100%;
	height: 100%;
	position: relative;
	transform-style: preserve-3d;
	transition: transform 0.1s ease-out;
}

.dice.is-rolling {
	transition: transform 0.1s ease-out;
}

.dice-face {
	position: absolute;
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
	border: 2px solid #ccc;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.8);
}

.dice-front {
	transform: translateZ(40px);
}
.dice-back {
	transform: rotateY(180deg) translateZ(40px);
}
.dice-right {
	transform: rotateY(90deg) translateZ(40px);
}
.dice-left {
	transform: rotateY(-90deg) translateZ(40px);
}
.dice-top {
	transform: rotateX(90deg) translateZ(40px);
}
.dice-bottom {
	transform: rotateX(-90deg) translateZ(40px);
}

.dot-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 1fr);
	width: 60px;
	height: 60px;
	gap: 2px;
}

.dot-cell {
	display: flex;
	align-items: center;
	justify-content: center;
}

.dot {
	width: 12px;
	height: 12px;
	background: #1a1a1a;
	border-radius: 50%;
	box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
}
</style>
