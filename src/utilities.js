// Returns random integer in this range: [0, max)
function randInt(max) {
	return Math.floor(Math.random() * Math.floor(max))
}

// Returns random element from array
function randElem(array) {
	return array[randInt(array.length)]
}

// Async waits the specified time
async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

module.exports = {
	randInt: randInt,
	randElem: randElem,
	wait: wait
}
