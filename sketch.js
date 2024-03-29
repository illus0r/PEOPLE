const pane = new Tweakpane.Pane()
let PARAMS = {
  strokeWidth: 1,
  brushSpread: 2,
  brushDensity: 0.8,
  zoom: 1,
}
pane.addInput(PARAMS, 'strokeWidth', {min: 0.1, max: 20}).on('change', () => {
  strokeWeight(PARAMS.strokeWidth)
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

////{{{
let notoFont

function preload() {
  // Load the Noto Sans font
  font = loadFont('./Quadrato.ttf')
}
let S, R, t, i
S = new Uint32Array(
  [4, 1, (ss = t = 2), 3].map(i =>
    parseInt('0x8571027db178A535d56335Adb0580abd2fF29274'.substr(i * 8, 8), 16),
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
// let sqr = [ [0, -1], [1, 0], [0, 1], [-1, 0] ];
let sqr = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]
let F = (n, f) => [...Array(n | 0)].map((_, i) => f(i))
let poly1 = []
let poly2 = []
let numVertices = 3 // Number of vertices for each polygon
let rot = (x, y, angle) => {
  let c = Math.cos(angle),
    s = Math.sin(angle)
  return [x * c - y * s, x * s + y * c]
}
let vadd = (a, b) => a.map((d, i) => d + b[i])
let vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
let vsub = (a, b) => a.map((d, i) => d - b[i])
let vmul = (a, s) => a.map(d => d * s)
let vnorm = a => {
  let l = Math.sqrt(vdot(a, a))
  return a.map(d => d / l)
}
let sscale = (s, m) => s.map(c => c.map(p => p.map(x => x * m)))
let strans = (s, v) => s.map(c => c.map(p => p.map((x, i) => x + v[i])))
let srot = (s, a) => s.map(c => c.map(p => rot(...p, a)))
////}}}

let abc = {
  ////{{{
  A: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, , , 1, , ,],
    [, , 1, , , ,],
  ],
  B: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, 1, , , 1, ,],
    [, , 1, , , , 1],
  ],
  C: [
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , , ,],
    [, 1, , , , ,],
    [, 1, , , , ,],
    [, , 1, , , ,],
    [, , , 1, , ,],
  ],
  D: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , , , , 1],
    [1, , , , , 1],
    [, 1, , , 1, ,],
    [, , 1, , , ,],
  ],
  E: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, 1, , , , ,],
    [, , 1, , , ,],
  ],
  F: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , ,],
    [1, , , , 1, ,],
    [, , , , , ,],
    [, , , , , , , ,],
  ],
  G: [
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , , ,],
    [, 1, , , 1, ,],
    [, 1, , , 1, ,],
    [, , 1, , 1, ,],
    [, , , 1, , ,],
  ],
  H: [
    [, , , 1, , ,],
    [, , , 1, , ,],
    [, , , 1, , ,],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, 1, , , 1, ,],
    [, , 1, , , ,],
  ],
  I: [
    [, , , , 1, ,],
    [, , , , , 1],
    [, , , , 1, , 1],
    [, , , 1, , ,],
    [1, , 1, , , ,],
    [, 1, , , , ,],
    [, , 1, , , ,],
  ],
  J: [
    [, , , , , 1],
    [, , , , 1, ,],
    [, , , 1, , ,],
    [, 1, , , , ,],
    [1, , , , , ,],
    [, 1, , , , ,],
    [, , 1, , , ,],
  ],
  K: [
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , , ,],
    [1, , , , 1, ,],
    [, 1, , 1, , ,],
    [, , 1, , , ,],
    [, , , 1, , ,],
  ],
  L: [
    [, , , , 1, ,],
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , , ,],
    [1, , , , , ,],
    [, 1, , , , ,],
    [, , 1, , , ,],
  ],
  M: [
    [1, , , , , 1],
    [, 1, , , 1, , 1],
    [, , 1, , , ,],
    [, , 1, , , ,],
    [, , , , , ,],
    [, , , , , ,],
    [, , , , , ,],
  ],
  N: [
    [1, , , , , 1],
    [, 1, , , 1, , 1],
    [, , 1, , , , 1],
    [, , , 1, , , 1],
    [, , , , 1, , 1],
    [, , , , , 1],
    [, , , , , ,],
  ],
  O: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , , , 1],
    [1, , , , 1, ,],
    [, 1, , 1, , ,],
    [, , 1, , , ,],
  ],
  P: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, , , , , ,],
    [, , , , , ,],
  ],
  Q: [
    [, , , 1, , ,],
    [, , 1, , , , 1],
    [, 1, , , , 1],
    [, 1, , , , 1],
    [, 1, , , , 1],
    [, , 1, 1, 1, 1, 1],
    [, , , , , ,],
  ],
  R: [
    [, , , , 1, ,],
    [, , , 1, , 1],
    [, , 1, , , , 1],
    [, 1, , 1, , 1],
    [1, , , , 1, ,],
    [, 1, , 1, , ,],
    [, , 1, , , ,],
  ],
  S: [
    [, , , 1, 1, 1],
    [, 1, , , , ,],
    [, 1, , , , ,],
    [, , , 1, 1, 1],
    [, , , , , 1],
    [1, , , , , 1],
    [, 1, 1, 1, , ,],
  ],
  T: [
    [1, 1, 1, 1, 1, 1, 1],
    [, , , , 1, ,],
    [, , , , 1, ,],
    [, , , , 1, ,],
    [, , , , 1, ,],
    [, , , , 1, ,],
    [, , , , , ,],
  ],
  U: [
    [, , , , 1, ,],
    [, , , 1, , ,],
    [, , 1, , , , 1],
    [, 1, , , , 1],
    [1, , , , 1, ,],
    [, 1, , 1, , ,],
    [, , 1, , , ,],
  ],
  V: [
    [, , 1, , , ,],
    [, , 1, , , ,],
    [, , 1, , , ,],
    [, , 1, , , ,],
    [, 1, , 1, , ,],
    [, 1, , 1, , ,],
    [1, , , 1, , ,],
  ],
  W: [
    [, , 1, 1, 1, 1],
    [, , 1, , , 1],
    [, 1, , , , , 1],
    [, 1, , , , , 1],
    [, 1, , , , , 1],
    [, , 1, , , 1],
    [, , 1, 1, 1, 1],
  ],
  X: [
    [1, , , , , 1],
    [, 1, , , 1, ,],
    [, , 1, , , ,],
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , 1, ,],
    [1, , , , , 1],
  ],
  Y: [
    [1, , , , , 1],
    [, 1, , , 1, ,],
    [, , 1, , , ,],
    [, , , 1, , ,],
    [, , 1, 1, 1, 1],
    [, , , , , 1],
    [, , , , , ,],
  ],
  Z: [
    [1, 1, 1, 1, 1, 1],
    [, , , , , 1],
    [, , , , 1, ,],
    [, , , 1, , ,],
    [, , 1, , , ,],
    [, 1, , , , ,],
    [1, 1, 1, 1, 1, 1],
  ],
} ////}}}

let N = 80
let sz = 15
let width = N * sz // / Math.sqrt(2)
let strokeW = sz / 20
let g = F(N, i => F(N, j => undefined))
// let g = F(N, (i) => F(N, (j) => Math.random() > 0.1 ? undefined : 'F'))
let currentLetter = 'A'
let brushSpread = 2
let seed = 0

function setup() {
  createCanvas(width, width)
  strokeWeight(PARAMS.strokeWidth)
  // textFont(font);
  textSize(sz * 1.4)
  textAlign(CENTER, CENTER)
  noFill()
  stroke(255)
  // drawShapes()
}

function drawGrid() {
  push()
  fill(0)
  noStroke()
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      let x = i * sz
      let y = j * sz
      text(g[j][i], x + sz / 2, y + sz / 2)
    }
  }
  pop()
}

function drawLetter() {
  push()
  fill(0)
  noStroke()
  let letterBlocks = abc[currentLetter]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterBlocks[0].length / 2) | 0
  mouseJ -= (letterBlocks.length / 2) | 0
  for (let j = 0; j < letterBlocks.length; j++) {
    for (let i = 0; i < letterBlocks[j].length; i++) {
      let I = i
      let J = j
      if (letterBlocks[j][i]) {
        let x = (mouseI + I) * sz
        let y = (mouseJ + J) * sz
        text(currentLetter, x, y)
      }
    }
  }
  pop()
}

function keyPressed() {
  // if a…z set it to A…Z
  if (key >= 'a' && key <= 'z') {
    currentLetter = key.toUpperCase()
  }
  // left right to change strokeWeight
  else if (key === 'ArrowLeft') {
    PARAMS.strokeWidth *= 0.9
    strokeWeight(PARAMS.strokeWidth)
  } else if (key === 'ArrowRight') {
    PARAMS.strokeWidth /= 0.9
    strokeWeight(PARAMS.strokeWidth)
  }
  // up down to change PARAMS.brushDensity
  else if (key === 'ArrowUp') {
    PARAMS.brushDensity += 0.1
    if (PARAMS.brushDensity > 1) PARAMS.brushDensity = 1
  } else if (key === 'ArrowDown') {
    PARAMS.brushDensity -= 0.1
    if (PARAMS.brushDensity < 0.1) PARAMS.brushDensity = 0.1
  }
  // shift to erase
  else if (key === 'Shift') {
    g = F(N, i => F(N, j => undefined))
  } else if (key === ' ') {
    seed = Math.random()
    console.log('seed:', seed)
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {
    brushSpread *= 1.01
    makeBrush(PARAMS.brushSpread)
  }
  if (event.delta < 0) {
    brushSpread /= 1.01
    makeBrush(PARAMS.brushSpread)
  }
}

function draw() {
  background(0)
  drawHelp()
  // rotate the viewport 45° CCW
  translate(width / 2, height / 2)
  rotate(-PI / 4)
  scale(sqrt(2))
  translate(-width / 2, -height / 2)
  randomSeed(seed * 9999)
  // drawGrid();
  updateShapes()
  shapes.map(s => drawShape(s, '#00F0'))
  // drawLetter();
}

function drawHelp() {
  push()
  fill(100)
  noStroke()
  textSize(20)
  textAlign(LEFT)

  text('To switch a letter, press A…Z', 10, 30)
  text('To change the stroke weight, use ← and → arrow keys', 10, 60)
  text('To change the pattern size, scroll ↑ ↓', 10, 90)
  text('To erace the letter, hold the shift key', 10, 120)
  text('To randomize the pattern, press space', 10, 150)
  text('To change the amount of contours, use ↑ ↓ arrow keys', 10, 180)

  pop()
}

function mousePressed() {
  let letterBlocks = abc[currentLetter]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterBlocks[0].length / 2) | 0
  mouseJ -= (letterBlocks.length / 2) | 0
  for (let j = 0; j < letterBlocks.length; j++) {
    for (let i = 0; i < letterBlocks[j].length; i++) {
      let I = i
      let J = j
      if (letterBlocks[j][i]) {
        if (keyIsPressed) {
          g[J + mouseJ][I + mouseI] = undefined
        } else {
          g[J + mouseJ][I + mouseI] = currentLetter
        }
      }
    }
  }
  updateShapes()
  drawHelp = () => {}
}

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
        paintCell(i, j)
      } else if (g[j][i]) {
        paintCell(i, j)
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
  ;[X, Y] = vmul([X, Y], 1 / sqrt(2))
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

function paintCell(i, j) {
  let [x, y] = ij2xy(i, j)
  brushTranslated = brush.map(s => strans(s, [x, y]))
  shapes = shapes.map((s, i) => unionShape(s, brushTranslated[i]))
  // shapes = shapes.map(s => ditherShape(s))
}

function removeRandomContour() {
  let rndi = -1,
    rndj = -1
  let counter = 0
  shapes.forEach((s, i) => {
    s.forEach((c, j) => {
      if (Math.random() < 1 / (counter + 1)) {
        rndi = i
        rndj = j
      }
      counter++
    })
  })
  if (rndi >= 0) {
    shapes[rndi].splice(rndj, 1)
  }
}

function unionShape(shape1, shape2) {
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

function drawPoly(poly, textFill = 0) {
  beginShape()
  for (let i = 0; i < poly.length; i++) {
    vertex(poly[i][0], poly[i][1])
    if (poly[i][2]) if (poly[i][2] > 0) circle(poly[i][0], poly[i][1], 20)
    // push();
    // noStroke();
    // fill(textFill);
    // text(i, ...poly[i]);
    // pop();
  }
  endShape(CLOSE)
}

function drawShape(shape, textFill = 0) {
  for (let c of shape) {
    if (random() > PARAMS.brushDensity) continue
    drawPoly(c, textFill)
  }
}

let cross = (a, b) => a[0] * b[1] - a[1] * b[0]
function generatePoly(numVertices) {
  let poly = []
  for (let i = 0; i < numVertices; i++) {
    let x = random(width) // Random x within first quarter of canvas width
    let y = random(height)
    poly.push([x, y])
  }
  poly = polyCCW(poly)
  return poly
}

function polyCCW(poly) {
  // Calculate cross product of the first two edges
  let firstEdge = [poly[1][0] - poly[0][0], poly[1][1] - poly[0][1]]
  let secondEdge = [poly[2][0] - poly[1][0], poly[2][1] - poly[1][1]]
  let crossProduct = cross(firstEdge, secondEdge)

  // If cross product is negative, reverse the polygon
  if (crossProduct < 0) {
    poly.reverse()
  }

  return poly
}

//}}}
