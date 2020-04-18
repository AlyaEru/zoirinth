//supports operations on an action queue

function make() {
	return {
		_queue: [],
		skip: 'skip',

		doAction: async function() {
			if (this._queue.length > 0) {
				let action = this._queue[0]
				this._queue = this._queue.slice(1)
				if ((await action()) === this.skip) {
					console.log('skipping')
					await this.doAction()
				}
			}
		},

		push: function(action) {
			this._queue.push(action)
		},

		unshift: function(action) {
			this._queue.unshift(action)
		}
	}
}

module.exports = {
	make
}
