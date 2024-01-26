<template>
	<section class="hero is-medium">
		<div class="columns is-mobile">
			<div class="column is-narrow-touch">
				<div class="has-text-left m-3">
					<button class="button is-small" @click="toSelect">&larr; <span class="is-hidden-touch">&nbsp;Terug</span></button>
				</div>
			</div>
			<div class="column">
				<progress-tables class="has-text-centered pt-3"></progress-tables>
			</div>
			<div class="column is-hidden-touch"></div>
		</div>
		<div class="hero-body py-0 has-text-centered">
			<div class="">
				<div class="question is-size-2" :class="{ wiggle: mistake }">
					{{ currentQuestion }}
				</div>
				<form class="answer is-size-1" @submit.prevent="checkAnswer">
					<div class="field has-addons is-justify-content-center">
						<div class="control">
							<input
								ref="answer"
								v-model="answer"
								class="input is-size-2 p-1"
								autofocus="true"
								type="text" inputmode="numeric" pattern="[0-9]*"
								x-webkit-speech
							/>
						</div>
						<div class="control">
							<input type="submit" class="button is-info is-size-2" value="→" />
						</div>
					</div>
				</form>
				<div
					class="is-size-1"
					:class="{ 'float-up': correct, 'is-hidden': !correct }"
				>
					{{ positiveEmoji }}
				</div>
				<div class="hint">
					<transition-group name="fade" tag="ul" class="tables">
						<li
							v-for="(hintItem, index) in currentHint"
							:key="hintItem"
							:class="{
								'is-size-5':
									index + 1 ===
									parseInt(currentQuestion.split(' x ')[0], 10),
							}"
						>
							{{ hintItem }}
						</li>
					</transition-group>
				</div>
			</div>
			<div class="points">
				🏆 {{ points * 10 }} ⏱
				{{ Math.round(medianStopwatch / 100.0) / 10.0 }} s
			</div>
		</div>
	</section>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import { mapActions, mapGetters, mapState } from 'vuex';
import ProgressTables from '@/components/ProgressTables.vue';

export default {
	components: { ProgressTables },
	data() {
		return {
			currentStopwatch: null,
			currentQuestion: '',
			timeoutId: null,
			answer: '',
			mistake: false,
			correct: false,
			hint: false,
			currentHint: [],
			currentHintIds: [],
			emojis: [
				'👍',
				'⭐️',
				'🌟',
				'💫',
				'🔥',
				'💥',
				'🍾',
				'❤️',
				'💖',
				'💎',
				'🤩',
				'😁',
				'💪',
				'🥇',
				'🏆',
				'🏵',
				'🎈',
				'💯',
				'☀️',
				'✅',
				'🎉',
			],
			positiveEmoji: '⭐️',
		};
	},
	computed: {
		...mapGetters(['values', 'currentIndex', 'medianStopwatch']),
		...mapState(['currentPerson', 'selectedTables']),
		needsNew() {
			return (
				this.values
					.filter((v) =>
						this.selectedTables.find(
							(sti) =>
								sti === v.table ||
								sti === parseInt(v.mul.split(' x ')[1], 10)
						)
					)
					.map((v) => v.bucket)
					.filter((n) => n === 0).length === 0
			);
		},
		points() {
			return this.values.map((v) => v.bucket).reduce((p, c) => p + c, 0);
		},
	},
	mounted() {
		if (this.needsNew) this.addOne();
		this.newQuestion();
		this.$refs.answer.focus();
	},
	methods: {
		...mapActions([
			'addOne',
			'saveCorrectAnswer',
			'saveLateAnswer',
			'saveWrongAnswer',
			'unsetPerson',
			'storeStopwatch',
		]),
		isAnswerCorrect(mul, answer) {
			const factors = mul.split(' x ');
			if (
				parseInt(factors[0], 10) * parseInt(factors[1], 10) ===
				parseInt(answer, 10)
			)
				return true;
			return false;
		},
		chooseOne() {
			const expanded = [];
			this.values
				.filter((v) =>
					this.selectedTables.find(
						(sti) =>
							sti === v.table ||
							sti === parseInt(v.mul.split(' x ')[1], 10)
					)
				)
				.forEach((value) => {
					const fib = [55, 21, 13, 5, 1];
					for (let index = 0; index < fib[value.bucket]; index++) {
						expanded.push(value.mul);
					}
				});
			return expanded[Math.floor(Math.random() * expanded.length)];
		},
		newQuestion() {
			this.currentQuestion = this.chooseOne();
			if (this.timeoutId) clearTimeout(this.timeoutId);
			const vm = this;
			vm.hint = false;
			if (this.currentQuestion) {
				this.timeoutId = setTimeout(function () {
					vm.hint = true;
					for (
						let index = 1;
						index <=
						parseInt(vm.currentQuestion.split(' x ')[0], 10);
						index++
					) {
						const a = parseInt(
							vm.currentQuestion.split(' x ')[1],
							10
						);
						const hintId = setTimeout(function () {
							vm.currentHint.push(
								`${index} x ${a}  = ${index * a}`
							);
						}, 1000 * index);
						vm.currentHintIds.push(hintId);
					}
				}, this.currentIndex * 300 + this.medianStopwatch * 1.5);
				this.currentStopwatch = Date.now();
			} else {
				this.$router.push({ path: '/finish' });
			}
		},
		checkAnswer() {
			const milliseconds = Date.now() - this.currentStopwatch;
			if (this.isAnswerCorrect(this.currentQuestion, this.answer)) {
				this.currentHint.splice(0, 20);
				this.currentHintIds.forEach((hintId) => clearTimeout(hintId));
				this.currentHintIds.splice(0, 20);
				if (!this.hint) {
					const vm = this;
					vm.positiveEmoji =
						vm.emojis[Math.floor(Math.random() * vm.emojis.length)];
					vm.correct = true;
					setTimeout(function () {
						vm.correct = false;
					}, 800);
					this.saveCorrectAnswer(this.currentQuestion);
					this.storeStopwatch(milliseconds);
				} else {
					this.saveLateAnswer(this.currentQuestion);
				}
				this.answer = '';
				if (this.needsNew) this.addOne();
				this.newQuestion();
			} else {
				const vm = this;
				vm.mistake = true;
				setTimeout(function () {
					vm.mistake = false;
				}, 820);
				this.saveWrongAnswer(this.currentQuestion);
			}
			this.$refs.answer.focus();
		},
		toSelect() {
			this.$router.push({ path: '/select-tables' });
		},
	},
};
</script>

<style lang="scss" scoped>
.points {
	position: absolute;
	bottom: 0;
	right: 0;
	padding: 0.5em;
}

input[type='text'] {
	text-align: center;
	width: 3.5em;
}

.tables {
	padding: 0;
	list-style: none;
}

.hint {
	margin-top: 1em;
}

.wiggle {
	animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0s infinite both;
	transform: translate3d(0, 0, 0);
	backface-visibility: hidden;
	perspective: 1000px;
}

@keyframes shake {
	10%,
	90% {
		transform: translate3d(-1px, 0, 0);
	}

	20%,
	80% {
		transform: translate3d(2px, 0, 0);
	}

	30%,
	50%,
	70% {
		transform: translate3d(-4px, 0, 0);
	}

	40%,
	60% {
		transform: translate3d(4px, 0, 0);
	}
}

@keyframes float-up {
	0% {
		opacity: 1;
		transform: translate3d(0, -2em, 0);
	}
	100% {
		opacity: 0;
		transform: translate3d(0, -4em, 0);
	}
}

.invisible {
	display: none;
}

.float-up {
	position: relative;
	transform: translate3d(0, -2em, 0);
	animation: float-up 0.82s ease-out 0s infinite forwards;
	z-index: 99;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
