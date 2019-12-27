!(function(e) {
	var r = {}
	function t(n) {
		if (r[n]) return r[n].exports
		var o = (r[n] = {i: n, l: !1, exports: {}})
		return e[n].call(o.exports, o, o.exports, t), (o.l = !0), o.exports
	}
	;(t.m = e),
		(t.c = r),
		(t.d = function(e, r, n) {
			t.o(e, r) || Object.defineProperty(e, r, {enumerable: !0, get: n})
		}),
		(t.r = function(e) {
			'undefined' != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty(e, Symbol.toStringTag, {value: 'Module'}),
				Object.defineProperty(e, '__esModule', {value: !0})
		}),
		(t.t = function(e, r) {
			if ((1 & r && (e = t(e)), 8 & r)) return e
			if (4 & r && 'object' == typeof e && e && e.__esModule) return e
			var n = Object.create(null)
			if (
				(t.r(n),
				Object.defineProperty(n, 'default', {enumerable: !0, value: e}),
				2 & r && 'string' != typeof e)
			)
				for (var o in e)
					t.d(
						n,
						o,
						function(r) {
							return e[r]
						}.bind(null, o)
					)
			return n
		}),
		(t.n = function(e) {
			var r =
				e && e.__esModule
					? function() {
							return e.default
					  }
					: function() {
							return e
					  }
			return t.d(r, 'a', r), r
		}),
		(t.o = function(e, r) {
			return Object.prototype.hasOwnProperty.call(e, r)
		}),
		(t.p = ''),
		t((t.s = 1))
})([
	function(e, r) {
		async function t(e, r, t, n) {
			let o = 0
			function c(e) {
				return Math.floor(Math.random() * Math.floor(e))
			}
			let a = []
			function u() {
				for (;;) {
					point = {x: 2 * c(t) + 1, y: 2 * c(n) + 1}
					let e = !1
					for (takenPoint of a)
						takenPoint.x == point.x && takenPoint.y == point.y && (e = !0)
					if (0 == e) return a.push(point), point
				}
			}
			const l = 2 * n + 1,
				i = 2 * t + 1,
				s = e + 4,
				d = e + 2
			let f = buildMaze(t, n, 0.5, 1 - ((e - 1) % 5) / 4)
			let p = {
					loc: u(),
					runMode: !0,
					clockSpeed: 20,
					score: r,
					shield: !1,
					type: 'player',
					dead: !1,
					escaped: !1
				},
				y = (function(e) {
					let r = []
					for (let t = 0; t < e; t++) r.push({loc: u(), type: 'zoid'})
					return r
				})(d),
				x = (function(e) {
					let r = []
					for (let t = 0; t < e; t++) r.push({loc: u(), type: 'clover'})
					return r
				})(s)
			const b = () => v(p, 'r'),
				m = () => v(p, 'l'),
				w = () => v(p, 'u'),
				h = () => v(p, 'd')
			function _() {
				mapCopy = JSON.parse(JSON.stringify(f))
				for (let e = 0; e < y.length; e++)
					mapCopy[y[e].loc.y][y[e].loc.x] = 'zoid'
				for (let e = 0; e < x.length; e++)
					mapCopy[x[e].loc.y][x[e].loc.x] = 'clover'
				return (
					(mapCopy[p.loc.y][p.loc.x] = p.dead
						? 'player_dead'
						: p.shield
						? 'player_shield'
						: 'player'),
					mapCopy
				)
			}
			function k(e, r) {
				let a = !1
				if ('player' == e.type)
					switch (S(r)) {
						case 'space':
							;(p.loc = r), (a = !0)
							break
						case 'clover':
							!(function(e, r) {
								for (let t = 0; t < e.length; t++)
									e[t].loc.x == r.x && e[t].loc.y == r.y && e.splice(t, 1)
							})(x, r),
								(p.score += 100),
								o++,
								o == s &&
									(function() {
										let e = c(2 * t + 2 * n)
										e < t
											? (f[0][2 * e + 1] = 'lr_portal')
											: e < 2 * t
											? (f[l - 1][2 * (e - t) + 1] = 'lr_portal')
											: e < 2 * t + n
											? (f[2 * (e - 2 * t) + 1][0] = 'ud_portal')
											: (f[2 * (e - 2 * t - n) + 1][i - 1] = 'ud_portal')
									})(),
								(p.loc = r),
								(a = !0)
							break
						case 'zoid':
							p.dead = !0
							break
						case 'lr_portal':
						case 'ud_portal':
							p.escaped = !0
					}
				return renderGameboard(_()), a
			}
			function v(e, r) {
				let t = ['clover', 'space', 'pod', 'superpod', 'lr_portal', 'ud_portal']
				return new Promise(function(n, o) {
					if (e.runMode) {
						k(e, g(e.loc, r)),
							renderGameboard(_()),
							setTimeout(function o() {
								!t.includes(M(e, r)) ||
								t.includes(
									M(
										e,
										(function(e) {
											switch (e) {
												case 'l':
													return 'u'
												case 'r':
													return 'd'
												case 'u':
													return 'r'
												case 'd':
													return 'l'
											}
										})(r)
									)
								) ||
								t.includes(
									M(
										e,
										(function(e) {
											switch (e) {
												case 'l':
													return 'd'
												case 'r':
													return 'u'
												case 'u':
													return 'l'
												case 'd':
													return 'r'
											}
										})(r)
									)
								)
									? n()
									: k(e, g(e.loc, r)) && setTimeout(o, e.clockSpeed)
							}, e.clockSpeed)
					} else k(e, g(e.loc, r)), renderGameboard(_()), n()
				})
			}
			function g(e, r) {
				switch (r) {
					case 'l':
						return {x: e.x - 1, y: e.y}
					case 'r':
						return {x: e.x + 1, y: e.y}
					case 'u':
						return {x: e.x, y: e.y - 1}
					case 'd':
						return {x: e.x, y: e.y + 1}
				}
			}
			function M(e, r) {
				return S(g(e.loc, r))
			}
			function S(e) {
				return e.x < 0 || e.x > i
					? 'outside'
					: e.y < 0 || e.y > l
					? 'outside'
					: _()[e.y][e.x]
			}
			let P = () => {}
			async function O(e) {
				return new Promise(r => {
					setTimeout(r, e)
				})
			}
			return (
				(document.onkeydown = function(e) {
					if (((e = e || window.event), !p.dead))
						switch (e.code) {
							case 'ArrowDown':
							case 'KeyS':
								P = h
								break
							case 'ArrowUp':
							case 'KeyW':
								P = w
								break
							case 'ArrowLeft':
							case 'KeyA':
								P = m
								break
							case 'ArrowRight':
							case 'KeyD':
								P = b
								break
							case 'KeyR':
								p.runMode = !p.runMode
						}
				}),
				launchGameboard(_()),
				await (async function(e) {
					for (; await e(), !p.escaped && !p.dead; ) await O(p.clockSpeed)
				})(async function() {
					;(ua = P), (P = () => {}), await ua()
				}),
				!!p.escaped && p.score
			)
		}
		e.exports = async function(e, r) {
			let n = 10,
				o = 1
			for (; (n = await t(o, n, e, r)), !1 !== n; ) o++
			console.log('dead')
		}
	},
	function(e, r, t) {
		e.exports = t(2)
	},
	function(e, r, t) {
		'use strict'
		t.r(r)
		var n = t(0),
			o = t.n(n)
		$(function() {
			o()(30, 18)
		})
	}
])
