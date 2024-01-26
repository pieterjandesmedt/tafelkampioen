import Vue from 'vue';
import Router from 'vue-router';
import PractiseTables from './views/PractiseTables.vue';
import ChoosePlayer from './views/ChoosePlayer.vue';
import FinishPage from './views/FinishPage.vue';
import SelectTables from './views/SelectTables.vue';

Vue.use(Router);

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/play',
			name: 'play',
			component: PractiseTables,
		},
		{
			path: '/',
			name: 'choose-player',
			component: ChoosePlayer,
		},
		{
			path: '/select-tables',
			name: 'select-tables',
			component: SelectTables,
		},
		{
			path: '/finish',
			name: 'finish',
			component: FinishPage,
		},
	],
});