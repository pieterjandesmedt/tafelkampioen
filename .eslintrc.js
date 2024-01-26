// .eslintrc.js
module.exports = {
	extends: ['plugin:vue/recommended', 'prettier'],
	rules: {
		'vue/html-indent': 'off',
		'vue/max-attributes-per-line': [
			'error',
			{
				singleline: 10,
				multiline: 10,
			},
		],
		'vue/singleline-html-element-content-newline': 'off',
		'vue/html-self-closing': 'off',
		'vue/html-closing-bracket-newline': 'off',
	},
};
