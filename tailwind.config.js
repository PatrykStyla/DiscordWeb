module.exports = {
	// darkMode: 'class',
	future: {
		// removeDeprecatedGapUtilities: true,
		// purgeLayersByDefault: true,
	},
	purge: {
		enabled: false,
		content: [
			'./src/**/*.tsx',
			'./index.html'
		]
	},
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [],
}
