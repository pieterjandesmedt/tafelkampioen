<template>
	<section class="hero is-fullheight">
		<div class="hero-body">
			<div class="container has-text-centered mb-6">
				<h1 class="is-size-2 is-hidden-desktop">🏆</h1>
				<h1 class="is-size-2"><span class="is-hidden-touch">🏆</span> Welkom bij Tafelkampioen <span class="is-hidden-touch">🏆</span></h1>
				<h4 class="is-size-4 mt-5">Wie wil er spelen?</h4>
				<div v-for="person in persons" :key="person" class="login is-size-3">
					<a @click="login(person)">{{ person }}</a>
				</div>
				<div>
					<button v-if="!showAdd" class="button is-text" @click="add">
						+ Iemand toevoegen
					</button>
					<form v-if="showAdd" @submit.prevent="addNewPerson">
						<div class="field has-addons">
							<p class="control">
								<input
									ref="addInput"
									v-model="newPerson"
									class="input"
									autofocus="true"
								/>
							</p>
							<p class="control">
								<input type="submit" class="button" value="⏎" :disabled="!newPerson"/>
							</p>
						</div>
					</form>
				</div>
				<!--div class="export">
					<button class="button" @click="exportData">Export</button>
				</div-->
			</div>
		</div>
	</section>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapState } from 'vuex';

function exportToJsonFile(jsonData) {
	let dataStr = JSON.stringify(jsonData);
	let dataUri =
		'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

	let exportFileDefaultName = 'tafelkampioen.json';

	let linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	linkElement.click();
}

export default {
	data() {
		return {
			showAdd: false,
			newPerson: '',
		};
	},
	computed: {
		...mapState(['persons']),
	},
	methods: {
		...mapActions(['setPerson', 'addPerson']),
		login(person) {
			console.log('person:', person);
			this.setPerson(person);
			this.$router.push({ path: '/select-tables' });
		},
		addNewPerson() {
			if (this.newPerson) {
				this.addPerson(this.newPerson);
				this.setPerson(this.newPerson);
				this.showAdd = false;
				this.$router.push({ path: '/select-tables' });
			}
		},
		add() {
			this.showAdd = true;
			this.$nextTick(function () {
				this.$refs.addInput.focus();
			});
		},
		exportData() {
			exportToJsonFile(this.$store.state);
		},
	},
};
</script>

<style lang="scss" scoped>
.export {
	position: fixed;
	bottom: 0;
	right: 0;
	padding: 0.5em;
	opacity: 0;
	transition: opacity 200ms;
	&:hover {
		opacity: 1;
	}
}

.field.has-addons {
	justify-content: center;
}
</style>
