<template>
	<section class="hero is-fullheight">
		<div class="has-text-left m-3">
			<button class="button is-small" @click="logout">&larr; <span class="is-hidden-touch">&nbsp;Iemand anders</span></button>
		</div>
		<div class="hero-body p-3">
			<div class="container has-text-centered">
				<h1 class="is-size-3">Word jij Tafelkampioen, {{ currentPerson }}?</h1>
				<div class="info mb-3">
					<!--star-rating
						:increment="0.5"
						:star-size="32"
						read-only
						:rating="totalScore"
						:show-rating="false"
					></star-rating-->
					<p v-if="points > 0" class="mt-3">
						Je hebt 🏆 {{ points * 10 }} punten verdiend.
						<span v-if="medianStopwatch !== 10000">Je vindt het antwoord
						gemiddeld binnen de ⏱
						{{ Math.round(medianStopwatch / 100.0) / 10.0 }} seconden.</span>
						{{ encouragement }}
					</p>
				</div>
				<h4 class="is-size-4 mt-3">Welke tafels wil je oefenen?</h4>
				<div class="buttons is-centered">
					<button class="button" @click="selectNone">Geen</button>
					<button class="button" @click="selectUpTo10">2 tot 10</button>
					<button class="button" @click="select11To20">11 tot 20</button>
					<button class="button" @click="selectAll">Allemaal</button>
				</div>
				<div class="list-table mb-3">
					<p>Of kies er zelf een paar:</p>
					<div class="columns is-mobile">
						<ul class="column is-narrow">
							<li
								v-for="item in 10"
								:key="item"
								:style="{ opacity: item === 1 ? 0 : 1 }"
							>
								<label :for="`table-${item}`" class="label">
									<input
										:id="`table-${item}`"
										v-model="selectedTables"
										type="checkbox"
										:value="item"
										:disabled="item === 1"
									/>
									{{ item }}
									<star-rating
										:increment="0.5"
										:star-size="12"
										read-only
										:rating="score(item)"
										:show-rating="false"
									>
									</star-rating>
									<span class="trash" @click="resetScore(item)"
										>🗑</span
									>
								</label>
							</li>
						</ul>
						<ul class="column is-narrow">
							<li v-for="item in 10" :key="item">
								<label :for="`table-${item + 10}`" class="label">
									<input
										:id="`table-${item + 10}`"
										v-model="selectedTables"
										type="checkbox"
										:value="item + 10"
									/>
									{{ item + 10 }}
									<star-rating
										:increment="0.5"
										:star-size="12"
										read-only
										:rating="score(item + 10)"
										:show-rating="false"
									>
									</star-rating>
									<span class="trash" @click="resetScore(item + 10)"
										>🗑</span
									>
								</label>
							</li>
						</ul>
					</div>
				</div>
				<div class="start mb-3">
					<button
						class="button is-primary"
						:disabled="selectedTables.length === 0"
						@click="startPlaying"
					>
						Start!
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import StarRating from 'vue-star-rating';

export default {
	components: { StarRating },
	data() {
		return {
			selectedTables: [],
		};
	},
	computed: {
		...mapGetters(['values', 'medianStopwatch']),
		...mapState(['currentPerson']),
		totalScore() {
			const buckets = this.values.map((v) => v.bucket);
			return buckets.length
				? buckets.reduce((p, c) => p + c, 0) / buckets.length
				: 0;
		},
		points() {
			return this.values.map((v) => v.bucket).reduce((p, c) => p + c, 0);
		},
		encouragement() {
			const encouragements = [
				'Goed bezig!',
				'Dat doe je goed!',
				'Oefening baart kunst!',
				'Je doet het fantastisch!',
				'Dat gaat goed!',
				'Ga zo door!',
				'Geweldig werk!',
				'Top!',
				'Trots op je!',
				'Super!',
				'Prima bezig!',
				'Hou vol!',
				'Je rockt!',
				'Fantastisch!',
				'Niet stoppen!',
				'Klasse!',
				'Ga ervoor!',
				'Perfect!',
				'Je maakt indruk!',
				'Topprestatie!',
				'Houd vol!',
				'Geweldig gedaan!',
				'Ga zo door, je bent op de goede weg!',
				'Jij bent echt geweldig bezig!',
				'Je inzet wordt opgemerkt, ga zo door!',
				'Dat is de spirit, blijf zo doorgaan!',
				'Je doet het voortreffelijk, hou vol!',
				'Gewoonweg briljant!',
				'Je bent echt goed bezig, ga door!',
				'Fantastisch werk, je verdient het!',
				'Je maakt vooruitgang, blijf gaan!',
				'Trots op je, ga zo door!',
			];
			return encouragements[Math.floor(Math.random() * encouragements.length)]
		}
	},
	methods: {
		...mapActions(['setSelectedTables', 'unsetPerson', 'resetScore']),
		selectAll() {
			this.selectedTables = [
				2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
				20,
			];
		},
		selectUpTo10() {
			this.selectedTables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
		},
		select11To20() {
			this.selectedTables = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		},
		selectNone() {
			this.selectedTables = [];
		},
		startPlaying() {
			this.setSelectedTables(this.selectedTables);
			this.$router.push({ path: '/play' });
		},
		score(item) {
			const buckets = this.values
				.filter(
					(v) =>
						item === v.table ||
						item === parseInt(v.mul.split(' x ')[1], 10)
				)
				.map((v) => v.bucket);
			return buckets.length
				? buckets.reduce((p, c) => p + c, 0) / buckets.length
				: 0;
		},
		logout() {
			this.unsetPerson();
			this.$router.push({ path: '/' });
		},
	},
};
</script>

<style lang="scss" scoped>
#app .vue-star-rating {
	display: inline-block;
}

ul {
	list-style: none;
	li {
		text-align: left;
	}
}

.list-table {
	display: table;
	margin: 0 auto;
}

.label {
	.trash {
		opacity: 0;
		cursor: pointer;
		transition: opacity 200ms;
	}
	&:hover .trash {
		opacity: 1;
	}
}
</style>
