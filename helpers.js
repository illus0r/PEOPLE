let S, t, i, ss
S = new Uint32Array(
  [4, 1, (ss = t = 2), 3].map(i =>
    parseInt('0x8888888888888888888888888888888888888888'.substr(i * 8, 8), 16),
  ),
)

let seed = 1

export function setSeed(s) {
  seed = s
}

export function R() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

export let F = (n, f) => [...Array(n | 0)].map((_, i) => f(i))
export let rot = (x, y, angle) => {
  let c = Math.cos(angle),
    s = Math.sin(angle)
  return [x * c - y * s, x * s + y * c]
}
export let vmul = (a, s) => a.map(d => d * s)
export let sscale = (s, m) => s.map(c => c.map(p => p.map(x => x * m)))
export let strans = (s, v) => s.map(c => c.map(p => p.map((x, i) => x + v[i])))
export let srot = (s, a) => s.map(c => c.map(p => rot(...p, a)))
export let PI = Math.PI
