// Returns random integer in this range: [0, max)
function randInt(max) {
	return Math.floor(Math.random() * Math.floor(max))
}

// Returns random element from array
function randElem(array) {
	return array[randInt(array.length)]
}

module.exports = {
	randInt: randInt,
	randElem: randElem
}
