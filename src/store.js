import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import { intersection, difference } from 'ramda';
import dayjs from 'dayjs';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
	storage: window.localStorage,
	key: 'tafelkampioen',
});

function median(array) {
	const values = [...array];
	if (values.length === 0) return 0;

	values.sort((a, b) => a - b);

	const half = Math.floor(values.length / 2);

	if (values.length % 2) return values[half];

	return (values[half - 1] + values[half]) / 2.0;
}

const order = [2, 10, 5, 4, 3, 8, 6, 9, 7, 11, 12, 20, 15, 14, 13, 16, 18, 19, 17];

export default new Vuex.Store({
	state: {
		selectedTables: [],
		currentPerson: '',
		persons: [],
		progress: {},
	},
	getters: {
		values: state => {
			if (state.currentPerson && state.progress[state.currentPerson]) return state.progress[state.currentPerson].values;
			return [];
		},
		currentIndex: state => {
			if (state.currentPerson && state.progress[state.currentPerson]) return state.progress[state.currentPerson].currentIndex;
			return [];
		},
		medianStopwatch: state => {
			if (state.currentPerson && state.progress[state.currentPerson] && state.progress[state.currentPerson].stopwatches)
				return median(state.progress[state.currentPerson].stopwatches) || 10000;
			return 10000;
		},
		score: state => {
			if (state.currentPerson && state.progress[state.currentPerson]) return state.progress[state.currentPerson].score || 0;
			return 0;
		}
	},
	mutations: {
		addValue(state, value) {
			state.progress[state.currentPerson].values.push(value);
		},
		increaseIndex(state) {
			state.progress[state.currentPerson].currentIndex = state.progress[state.currentPerson].currentIndex + 1;
		},
		updateBucket(state, { index, value }) {
			const newValue = {
				...state.progress[state.currentPerson].values[index],
				bucket: value,
			};
			state.progress[state.currentPerson].values.splice(index, 1, newValue);
		},
		setLastPracticedToToday(state) {
			const today = dayjs().format('YYYY-MM-DD');
			if (state.currentPerson && state.selectedTables.length) {
				state.progress[state.currentPerson].values.forEach((value, index) => {
					if (state.selectedTables.includes(parseInt(value.mul.split(' x ')[1], 10)))
						Vue.set(state.progress[state.currentPerson].values[index], 'lastPracticed', today);
				})
			}
		},
		updateBucketsAccordingToDate(state) {
			if (state.currentPerson) {
				const today = dayjs();
				state.progress[state.currentPerson].values.forEach((value, index) => {
					const difference = today.diff(dayjs(value.lastPracticed || '2000-01-01'), 'day');
					let maxBucket = 5;
					if (difference === 1) maxBucket = 4;
					if (difference > 1) maxBucket = 3;
					if (difference > 5) maxBucket = 2;
					if (difference > 13) maxBucket = 1;
					if (difference > 21) maxBucket = 0;
					Vue.set(state.progress[state.currentPerson].values[index], 'bucket', Math.min(value.bucket, maxBucket));
				})
			}
		},
		setScore(state, value) {
			if (state.currentPerson) {
				state.progress[state.currentPerson].score = value
			}
		},
		addToScore(state, value) {
			if (state.currentPerson) {
				state.progress[state.currentPerson].score += value;
			}
		},
		addPerson(state, value) {
			if (!state.persons.find(p => p === value)) {
				state.persons.push(value);
				Vue.set(state.progress, value, {
					values: [],
					currentIndex: 0,
					stopwatches: [],
					score: 0,
				});
			}
		},
		removePerson(state, value) {
			if (state.currentPerson === value) state.currentPerson = ''
			const personIndex = state.persons.findIndex(p => p === value);
			if (personIndex !== -1) {
				state.persons.splice(personIndex, 1);
				Vue.delete(state.progress, value)
			}
		},
		setPerson(state, value) {
			if (state.persons.find(p => p === value)) {
				state.currentPerson = value;
			}
		},
		unsetPerson(state) {
			state.currentPerson = '';
		},
		setSelectedTables(state, value) {
			Vue.set(state, 'selectedTables', [...value]);
		},
		storeStopwatch(state, value) {
			if (!state.progress[state.currentPerson].stopwatches) Vue.set(state.progress[state.currentPerson], 'stopwatches', []);
			if (state.progress[state.currentPerson].stopwatches.length > 100) state.progress[state.currentPerson].stopwatches.splice(0, 1);
			state.progress[state.currentPerson].stopwatches.push(value);
		},
		resetScore(state, value) {
			const newValues = state.progress[state.currentPerson].values.filter(v => parseInt(v.mul.split(' x ')[1], 10) !== value);
			Vue.set(state.progress[state.currentPerson], 'values', newValues);
		},
	},
	actions: {
		addOne({ commit, state }) {
			const today = dayjs().format('YYYY-MM-DD');
			// what are the elements I want to practice?
			const wantToPractice = intersection(order, state.selectedTables);
			// select the difference between practiced and wantToPractice
			const practiced = state.progress[state.currentPerson].values.map(v => v.table || parseInt(v.mul.split(' x ')[1], 10));
			const diff = difference(wantToPractice, practiced);
			// take the first element of the difference

			const element = diff[0];
			if (element) {
				for (let index = 1; index <= (element <= 10 ? 10 : element); index++) {
					commit('addValue', {
						mul: `${index} x ${element}`,
						table: element,
						bucket: 0,
						lastPracticed: today
					});
				}
				commit('increaseIndex');
			}
		},
		setLastPracticedToToday({ commit }) {
			commit('setLastPracticedToToday');
		},
		updateBucketsAccordingToDate({ commit }) {
			commit('updateBucketsAccordingToDate');
		},
		saveCorrectAnswer({ commit, state }, question) {
			const index = state.progress[state.currentPerson].values.findIndex(v => v.mul === question);
			const value = Math.max(state.progress[state.currentPerson].values[index].bucket + 1, 0);
			commit('updateBucket', { index, value });
			commit('addToScore', 10);
		},
		saveLateAnswer({ commit, state }, question) {
			const index = state.progress[state.currentPerson].values.findIndex(v => v.mul === question);
			const value = Math.max(state.progress[state.currentPerson].values[index].bucket - 2, 0);
			commit('updateBucket', { index, value });
			commit('addToScore', 5);
		},
		saveWrongAnswer({ commit, state }, question) {
			const index = state.progress[state.currentPerson].values.findIndex(v => v.mul === question);
			const value = 0;
			commit('updateBucket', { index, value });
		},
		addPerson({ commit }, value) {
			commit('addPerson', value);
		},
		removePerson({ commit }, value) {
			commit('removePerson', value);
		},
		setPerson({ commit }, value) {
			commit('setPerson', value);
		},
		unsetPerson({ commit }) {
			commit('unsetPerson');
		},
		storeStopwatch({ commit }, value) {
			commit('storeStopwatch', value);
		},
		setSelectedTables({ commit }, value) {
			commit('setSelectedTables', value);
		},
		resetScore({ commit }, item) {
			commit('resetScore', item);
		}
	},
	plugins: [vuexLocal.plugin],
});
