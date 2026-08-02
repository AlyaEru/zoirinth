// Returns random integer in this range: [0, max)
function randInt(max) {
	return Math.floor(Math.random() * Math.floor(max))
}

// Returns random element from array
function randElem(array) {
	return array[randInt(array.length)]
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
	var j, x, i
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1))
		x = a[i]
		a[i] = a[j]
		a[j] = x
	}
	return a
}

// Async waits the specified time
async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

// Converts ms to hh:mm:ss
function readableTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms  / 1000 / 3600 ) % 24)

  const readable = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0")
  ].join(':');

  return readable;
}

module.exports = {
	randInt: randInt,
	randElem: randElem,
	wait: wait,
	shuffle: shuffle,
	readableTime: readableTime
}
