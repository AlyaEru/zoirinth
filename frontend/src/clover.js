const util = require('./utilities')
const dirs = require('./directions')
const renderMap = require('./renderMap')
const constants = require('./gameConstants').constants

// Returns a new clover
function make(map) {
	let clover = {
		getClass: () => 'clover',
		type: 'clover'
	}
	map.entities.clovers.push(clover)
	return clover
}

function randSpawn(map) {
	let clover = make(map)
	map.spawnEntity(clover)
	return clover
}

function drop(map, loc) {
	let clover = make(map)
	clover.loc = loc
	return clover
}

module.exports = {
	randSpawn,
	drop
}
