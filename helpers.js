export let R
let S, t, i, ss
S = new Uint32Array(
  [4, 1, (ss = t = 2), 3].map(i =>
    parseInt('0x8888888888888888888888888888888888888888'.substr(i * 8, 8), 16),
  ),
)

export let setSeed = seed => {
  S = [1e5 * seed, 2e5 * seed, 3e5 * seed, 4e5 * seed]
  // S.map(i => i * 1e8).map(i => {
  //   i ^= i << 13
  //   i ^= i >>> 17
  //   i ^= i << 5
  // })
}

R = _ => {
  return (
    (t = S[3]),
    (S[3] = S[2]),
    (S[2] = S[1]),
    (S[1] = ss = S[0]),
    (t ^= t << 11),
    (S[0] ^= t ^ (t >>> 8) ^ (ss >>> 19)),
    S[0] / 2 ** 32
  )
}
;('tx piter')
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
