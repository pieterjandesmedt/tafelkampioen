import Vue from 'vue';
import VueGtag from 'vue-gtag';

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.use(
	VueGtag,
	{
		config: { id: 'UA-115057381-2' },
		appName: 'Tafelkampioen',
		pageTrackerScreenviewEnabled: true,
	},
	router
);

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app');
