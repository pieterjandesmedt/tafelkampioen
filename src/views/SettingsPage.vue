<template>
	<section class="hero">
		<div class="has-text-left m-3">
			<button class="button is-small" @click="toSelect">&larr; <span class="is-hidden-touch">&nbsp;Terug</span></button>
		</div>
		<div v-if="persons.length" class="hero-body">
			<div class="container mb-6">
				<h1 class="is-size-2">Instellingen</h1>
				<!--h4 class="is-size-4 mt-5">Verwijderen</h4-->
				<div
					v-for="person in persons"
					:key="person"
					class="login is-size-5"
				>
					<a class="has-text-danger" @click="remove(person)">Verwijder {{ person }}</a>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapState } from 'vuex';

export default {
	computed: {
		...mapState(['persons']),
	},
	methods: {
		...mapActions(['removePerson']),
		remove(person) {
			this.removePerson(person);
		},
		toSelect() {
			this.$router.push({ path: '/' });
		},
	},
};
</script>
