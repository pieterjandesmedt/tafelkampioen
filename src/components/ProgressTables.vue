<template>
	<ul class="tables">
		<li
			v-for="item in items"
			:key="item"
			class="done"
			:style="{ opacity: howGood(item) }"
		>
			{{ item }}
		</li>
	</ul>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { intersection } from 'ramda';
const allTables = [
	2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export default {
	computed: {
		...mapState(['selectedTables']),
		...mapGetters(['values']),
		items() {
			return intersection(this.selectedTables, allTables);
		},
	},
	methods: {
		howGood(number) {
			return (
				(this.values
					.filter(
						(v) => parseInt(v.mul.split(' x ')[1], 10) === number
					)
					.map((v) => v.bucket + 1)
					.reduce((p, c) => p + c, 0) || 10) / 50
			);
		},
	},
};
</script>

<style lang="scss" scoped>
.tables {
	padding: 0;
	list-style: none;
	li {
		display: inline;
		margin: 0 0.2em;
	}
}
</style>
