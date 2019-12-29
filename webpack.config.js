const path = require('path')

module.exports = {
	target: 'web',
	mode: 'development',
	entry: ['./src/main.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	}
}
