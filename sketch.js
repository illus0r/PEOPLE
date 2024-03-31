import {abc} from './abc.js'
// UI
////{{{
const pane = new Tweakpane.Pane()
let PARAMS = {
  strokeWeight: 1,
  brushSpread: 2,
  brushDensity: 0.8,
  zoom: 1,
}
pane.addInput(PARAMS, 'strokeWeight', {min: 0.1, max: 20}).on('change', () => {
  // strokeWeight(PARAMS.strokeWeight)
})
pane.addInput(PARAMS, 'brushSpread', {min: 0.1, max: 20}).on('change', () => {
  makeBrush(PARAMS.brushSpread)
})
pane.addInput(PARAMS, 'zoom', {min: 0.1, max: 10})
pane.addInput(PARAMS, 'brushDensity', {min: 0.1, max: 1})
//buttons
pane.addButton({title: 'randomize'}).on('click', () => {
  console.log('randomize:')
})
// save svg
pane.addButton({title: 'save svg'}).on('click', () => {})
////}}}

// Helpers
//{{{
let PI = Math.PI
let [mouseX, mouseY] = [0, 0]
let S, R, t, i, ss
S = new Uint32Array(
  [4, 1, (ss = t = 2), 3].map(i =>
    parseInt('0x8571027db178A535d56335A3b0580abd2fF29274'.substr(i * 8, 8), 16),
  ),
)
R = _ => (
  (t = S[3]),
  (S[3] = S[2]),
  (S[2] = S[1]),
  (S[1] = ss = S[0]),
  (t ^= t << 11),
  (S[0] ^= t ^ (t >>> 8) ^ (ss >>> 19)),
  S[0] / 2 ** 32
)
;('tx piter')
let F = (n, f) => [...Array(n | 0)].map((_, i) => f(i))
let rot = (x, y, angle) => {
  let c = Math.cos(angle),
    s = Math.sin(angle)
  return [x * c - y * s, x * s + y * c]
}
let vmul = (a, s) => a.map(d => d * s)
let sscale = (s, m) => s.map(c => c.map(p => p.map(x => x * m)))
let strans = (s, v) => s.map(c => c.map(p => p.map((x, i) => x + v[i])))
let srot = (s, a) => s.map(c => c.map(p => rot(...p, a)))
////}}}

// let sqr = [ [0, -1], [1, 0], [0, 1], [-1, 0] ];
let sqr = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]
let svg = document.querySelector('svg')

let N = 80
let sz = 15
let width = N * sz // / Math.sqrt(2)
let height = 800
let g = F(N, _ => F(N, _ => undefined))
// let g = F(N, (i) => F(N, (j) => Math.random() > 0.1 ? undefined : 'F'))
let currentLetter = 'A'
let seed = 0

function setup() {
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('style', 'background: #554')
}
setup()

// function keyPressed() {
//   // if a…z set it to A…Z
//   if (key >= 'a' && key <= 'z') {
//     currentLetter = key.toUpperCase()
//   }
//   // left right to change strokeWeight
//   else if (key === 'ArrowLeft') {
//     PARAMS.strokeWeight *= 0.9
//     // strokeWeight(PARAMS.strokeWeight)
//   } else if (key === 'ArrowRight') {
//     PARAMS.strokeWeight /= 0.9
//     // strokeWeight(PARAMS.strokeWeight)
//   }
//   // up down to change PARAMS.brushDensity
//   else if (key === 'ArrowUp') {
//     PARAMS.brushDensity += 0.1
//     if (PARAMS.brushDensity > 1) PARAMS.brushDensity = 1
//   } else if (key === 'ArrowDown') {
//     PARAMS.brushDensity -= 0.1
//     if (PARAMS.brushDensity < 0.1) PARAMS.brushDensity = 0.1
//   }
//   // shift to erase
//   else if (key === 'Shift') {
//     g = F(N, _ => F(N, _ => undefined))
//   } else if (key === ' ') {
//     seed = Math.random()
//     console.log('seed:', seed)
//   }
// }

// function draw() {
//   svg.innerHTML = ''
//   background(0)
//   drawHelp()
//   // rotate the viewport 45° CCW
//   translate(width / 2, height / 2)
//   rotate(-PI / 4)
//   scale(Math.sqrt(2))
//   translate(-width / 2, -height / 2)
//   randomSeed(seed * 9999)
//   updateShapes()
//   shapes.map(s => drawShape(s, '#00F0'))
// }

// function drawHelp() {
//   push()
//   fill(100)
//   noStroke()
//   textSize(20)
//   textAlign(LEFT)

//   text('To switch a letter, press A…Z', 10, 30)
//   text('To change the stroke weight, use ← and → arrow keys', 10, 60)
//   text('To change the pattern size, scroll ↑ ↓', 10, 90)
//   text('To erace the letter, hold the shift key', 10, 120)
//   text('To randomize the pattern, press space', 10, 150)
//   text('To change the amount of contours, use ↑ ↓ arrow keys', 10, 180)

//   pop()
// }

document.addEventListener('click', e => {
  let letterBlocks = abc[currentLetter]
  console.log('letterBlocks:', letterBlocks)
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterBlocks[0].length / 2) | 0
  mouseJ -= (letterBlocks.length / 2) | 0
  for (let j = 0; j < letterBlocks.length; j++) {
    for (let i = 0; i < letterBlocks[j].length; i++) {
      let I = i
      let J = j
      if (letterBlocks[j][i]) {
        if (e.shiftKey) {
          g[J + mouseJ][I + mouseI] = undefined
        } else {
          g[J + mouseJ][I + mouseI] = currentLetter
        }
      }
    }
  }
  updateShapes()
  drawHelp = () => {}
})

//{{{

let shapes = [[], [], [], []]
let brush

function makeBrush(brushSpread = 2) {
  brush = [
    sscale([sqr], ((0.999 * sz * brushSpread) / 8) * 0.5),
    sscale([sqr], ((0.999 * sz * brushSpread) / 8) * 1.5),
    sscale([sqr], ((0.999 * sz * brushSpread) / 8) * 2.5),
    sscale([sqr], ((0.999 * sz * brushSpread) / 8) * 3.5),
  ]
}
makeBrush(PARAMS.brushSpread)

let brushTranslated

// function draw() {
// 	background(220);
// 	brushTranslated = brush.map((s) => strans(s, [mouseX, mouseY]))
// 	strokeWeight(.5);
// 	brushTranslated.map((s) => drawShape(s, "#F000"));
// 	strokeWeight(2);
// 	shapes.map((s) => drawShape(s, "#00F0"));
// }

function drawShapes() {
  svg.innerHTML = ''
  background(220)
  shapes.map(s => drawShape(s, '#00F2'))
}

function updateShapes() {
  shapes = [[], [], [], []]

  let letterBlocks = abc[currentLetter]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterBlocks[0].length / 2) | 0
  mouseJ -= (letterBlocks.length / 2) | 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let I = i - mouseI
      let J = j - mouseJ
      if (letterBlocks[J] && letterBlocks[J][I]) {
        addModuleToShapes(i, j)
      } else if (g[j][i]) {
        addModuleToShapes(i, j)
      }
    }
  }
}

function xy2ij(x, y) {
  let X = x,
    Y = y
  X -= width / 2
  Y -= height / 2
  ;[X, Y] = rot(X, Y, PI / 4)
  ;[X, Y] = vmul([X, Y], 1 / Math.sqrt(2))
  X += width / 2
  Y += height / 2
  let i = Math.floor(X / sz + 0.5)
  let j = Math.floor(Y / sz + 0.5)
  return [i, j]
}

function ij2xy(i, j) {
  let x = i * sz
  let y = j * sz
  return [x, y]
}

function addModuleToShapes(i, j) {
  let [x, y] = ij2xy(i, j)
  brushTranslated = brush.map(s => strans(s, [x, y]))
  shapes = shapes.map((s, i) => unionShapes(s, brushTranslated[i]))
  // shapes = shapes.map(s => ditherShape(s))
}

function unionShapes(shape1, shape2) {
  let clipper = new ClipperLib.Clipper()

  // Scale up the shapes if necessary
  let scale = 100
  let subj_paths = shape1.map(poly =>
    poly.map(point => ({X: point[0] * scale, Y: point[1] * scale})),
  )
  let clip_paths = shape2.map(poly =>
    poly.map(point => ({X: point[0] * scale, Y: point[1] * scale})),
  )

  // Add the paths to the clipper
  clipper.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true)
  clipper.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true)

  // Perform union operation
  let solution_paths = new ClipperLib.Paths()
  clipper.Execute(ClipperLib.ClipType.ctUnion, solution_paths)

  // Convert the solution paths back to your format
  let resultShape = solution_paths.map(poly =>
    poly.map(point => [point.X / scale, point.Y / scale]),
  )

  return resultShape
}

function drawShape(shape, textFill = 0) {
  for (let c of shape) {
    if (random() > PARAMS.brushDensity) continue
    drawPoly(c, textFill)
  }
}

function drawPoly(poly, textFill = 0) {
  let path = '<path d="M'
  for (let i = 0; i < poly.length; i++) {
    path += `${poly[i][0]} ${poly[i][1]} `
    if (poly[i][2] && poly[i][2] > 0) {
      // Adjust radius and position to match your circle parameters
      path += `M ${poly[i][0] + 10} ${poly[i][1]} m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 `
    }
  }
  path += 'Z" fill="none" stroke-width=`${PARAMS.strokeWeight}` stroke="black"/>'
  // add to the SVG
  svg.innerHTML += path
}

document.onmousemove = e => {
  ;[mouseX, mouseY] = [e.clientX, e.clientY]
  console.log('mouseX, mouseY:', mouseX, mouseY)
}

//}}}
