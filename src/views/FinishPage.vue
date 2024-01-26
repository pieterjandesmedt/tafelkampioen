<template>
	<section class="hero is-fullheight">
		<div class="has-text-left m-3">
			<button class="button is-small" @click="toSelect">&larr; <span class="is-hidden-touch">&nbsp;Terug</span></button>
		</div>
		<div class="hero-body has-text-centered">
			<div class="finish container">
				<h1 class="is-size-2">Super goed gedaan! {{ emojis[Math.floor(Math.random() * emojis.length)] }}</h1>
				<h4 class="is-size-4">Deze tafels ken jij perfect, {{ currentPerson }}:</h4>
				<p class="mb-3">
					{{ perfect.join(', ') }}
				</p>
				<button class="button is-primary" @click="toSelect">Oefen andere tafels</button>
			</div>
		</div>
	</section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { difference, intersection } from 'ramda';

const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default {
	data() {
		return {
			emojis: ['👍', '⭐️', '🌟', '💫', '🔥', '💥', '🍾', '❤️', '💖', '💎', '🤩', '😁', '💪', '🥇', '🏆', '🏵', '🎈', '💯', '☀️', '✅', '🎉'],
		};
	},
	computed: {
		...mapGetters(['values']),
		...mapState(['currentPerson']),
		perfect() {
			const intersect = intersection(
				tables,
				this.values.map(v => v.table || parseInt(v.mul.split(' x ')[1], 10))
			);

			console.log('intersect:', intersect);
			console.log(this.values.filter(v => v.bucket < 5).map(v => v.table || parseInt(v.mul.split(' x ')[1], 10)));
			return difference(
				intersect,
				this.values.filter(v => v.bucket < 5).map(v => v.table || parseInt(v.mul.split(' x ')[1], 10))
			);
		},
	},
	methods: {
		toSelect() {
			this.$router.push({ path: '/select-tables' });
		},
	},
};
</script>
