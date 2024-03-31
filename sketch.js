import {abc} from './abc.js'
import {R, F, rot, vmul, sscale, strans, srot, PI} from './helpers.js'
// UI
////{{{
const pane = new Tweakpane.Pane()

let PARAMS = {
  strokeWeight: 1,
  moduleSize: 2,
  contourDensity: 0.8,
  zoom: 1,
}
pane.addInput(PARAMS, 'strokeWeight', {min: 0.1, max: 20}).on('change', () => {
  // strokeWeight(PARAMS.strokeWeight)
  updateStrokeWeight()
})
pane.addInput(PARAMS, 'moduleSize', {min: 0.1, max: 20}).on('change', () => {
  resizeModule(PARAMS.moduleSize)
  updateShapes()
  drawShapes()
})
pane.addInput(PARAMS, 'zoom', {min: 0.1, max: 10})
pane.addInput(PARAMS, 'contourDensity', {min: 0.1, max: 1}).on('change', () => {
  updateShapes()
  drawShapes()
})
//buttons
pane.addButton({title: 'randomize'}).on('click', () => {
  // console.log('randomize:')
})
// save svg
pane.addButton({title: 'save svg'}).on('click', () => {
  saveSVG(svg, 'PEOPLE.svg')
})
////}}}

// Helpers
//{{{
////}}}

let svg = document.querySelector('svg')
let [mouseX, mouseY] = [0, 0]
// let sqr = [
//   [0, -1],
//   [1, 0],
//   [0, 1],
//   [-1, 0],
// ]
let sqr = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

let N = 40
let gridSize = 15
let width = N * gridSize // / Math.sqrt(2)
let height = 800
let g = F(N, i => F(N, j => (R() > 0.05 ? undefined : 'F')))
// let g = F(N, _ => F(N, _ => undefined))
g[2][2] = 'F'
g[3][3] = 'F'
let currentLetter = 'A'
let seed = 0
let moduleTranslated

function setup() {}
setup()

// document.addEventListener('click', e => {
//   let letterMatrix = abc[currentLetter]
//   console.log('letterMatrix:', letterMatrix)
//   let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
//   mouseI -= (letterMatrix[0].length / 2) | 0
//   mouseJ -= (letterMatrix.length / 2) | 0
//   for (let j = 0; j < letterMatrix.length; j++) {
//     for (let i = 0; i < letterMatrix[j].length; i++) {
//       let I = i
//       let J = j
//       if (letterMatrix[j][i]) {
//         if (e.shiftKey) {
//           g[J + mouseJ][I + mouseI] = undefined
//         } else {
//           g[J + mouseJ][I + mouseI] = currentLetter
//         }
//       }
//     }
//   }
//   updateShapes()
//   drawHelp = () => {}
// })

//{{{

let shapes = [[], [], [], []]
let brush

function resizeModule(moduleSize = 2) {
  brush = [
    sscale([sqr], (0.999 * gridSize * moduleSize * 0.5) / 4),
    sscale([sqr], (0.999 * gridSize * moduleSize * 1.5) / 4),
    sscale([sqr], (0.999 * gridSize * moduleSize * 2.5) / 4),
    sscale([sqr], (0.999 * gridSize * moduleSize * 3.5) / 4),
  ]
}
resizeModule(PARAMS.moduleSize)

let path
function drawShapes() {
  svg.innerHTML = ''
  path = ''
  path = '<path d="'
  shapes.map(s => drawShape(s))
  path += '" />'
  svg.innerHTML += path
}

function updateShapes() {
  // console.log('updateShapes:')
  shapes = [[], [], [], []]

  let letterMatrix = abc[currentLetter]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterMatrix[0].length / 2) | 0
  mouseJ -= (letterMatrix.length / 2) | 0

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let I = i - mouseI
      let J = j - mouseJ
      if ((letterMatrix[J] && letterMatrix[J][I]) || g[j][i]) {
        addModuleToShapes(i, j)
      }
    }
  }
}

function addModuleToShapes(i, j) {
  let [x, y] = ij2xy(i, j)
  moduleTranslated = brush.map(s => strans(s, [x, y]))
  shapes = shapes.map((s, i) => unionShapes(s, moduleTranslated[i]))
}

function xy2ij(x, y) {
  let X = x
  let Y = y
  X -= width / 2
  Y -= height / 2
  ;[X, Y] = rot(X, Y, PI / 4)
  ;[X, Y] = vmul([X, Y], 1 / Math.sqrt(2))
  X += width / 2
  Y += height / 2
  let i = Math.floor(X / gridSize + 0.5)
  let j = Math.floor(Y / gridSize + 0.5)
  return [i, j]
}

function ij2xy(i, j) {
  let x = i * gridSize
  let y = j * gridSize
  return [x, y]
}

function unionShapes(shape1, shape2) {
  // console.log('shape1:', JSON.stringify(shape1))
  // console.log('shape2:', JSON.stringify(shape2))
  let clipper = new ClipperLib.Clipper()
  let scale = 100
  let subj_paths = shape1.map(contour =>
    contour.map(point => ({X: point[0] * scale, Y: point[1] * scale})),
  )
  let clip_paths = shape2.map(contour =>
    contour.map(point => ({X: point[0] * scale, Y: point[1] * scale})),
  )

  clipper.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true)
  clipper.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true)

  let solution_paths = new ClipperLib.Paths()
  clipper.Execute(ClipperLib.ClipType.ctUnion, solution_paths)

  let resultShape = solution_paths.map(contour =>
    contour.map(point => [point.X / scale, point.Y / scale]),
  )

  // console.log('resultShape:', JSON.stringify(resultShape))
  return resultShape
}

function drawShape(shape) {
  // console.log('shape')
  for (let c of shape) {
    if (R() > PARAMS.contourDensity) {
      continue
      // drawContour(c, 0)
    } else {
      drawContour(c, 1)
    }
  }
}

function drawContour(contour, opacity = 1) {
  for (let i = 0; i < contour.length; i++) {
    if (i == 0) {
      path += `M ${contour[i][0]} ${contour[i][1]} `
    } else {
      path += `L ${contour[i][0]} ${contour[i][1]} `
    }
  }
  path += `Z `
  // if (opacity != 1) path += `display="none" `
  // add to the SVG
  svg.innerHTML += path
}

document.onmousemove = e => {
  ;[mouseX, mouseY] = [e.clientX, e.clientY]
  // console.log('mouseX, mouseY:', mouseX, mouseY)
}

//}}}
//   text('To switch a letter, press A…Z', 10, 30)
//   text('To change the stroke weight, use ← and → arrow keys', 10, 60)
//   text('To change the pattern size, scroll ↑ ↓', 10, 90)
//   text('To erace the letter, hold the shift key', 10, 120)
//   text('To randomize the pattern, press space', 10, 150)
//   text('To change the amount of contours, use ↑ ↓ arrow keys', 10, 180)

svg.setAttribute('stroke', '#fff')

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
}
resize()
window.addEventListener('resize', resize)

function updateStrokeWeight() {
  svg.setAttribute('stroke-width', PARAMS.strokeWeight)
}

// print g
updateShapes()
shapes.forEach(s => {
  s.forEach(c => {
    // console.log(c)
  })
})
drawShapes()

function saveSVG(svgElement, fileName) {
  const svgContent = svgElement.outerHTML
  console.log('svgContent:', svgContent)

  const blob = new Blob([svgContent], {type: 'image/svg+xml'})
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
