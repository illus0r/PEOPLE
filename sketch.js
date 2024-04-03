import {abc} from './abc.js'
import {R, setSeed, F, rot, vmul, sscale, strans, srot, PI} from './helpers.js'
// UI
////{{{
const pane = new Tweakpane.Pane()
pane.registerPlugin(TweakpaneInfodumpPlugin)
pane.addBlade({
  view: 'infodump',
  content: F(
    100 + 100 * Math.random(),
    i => 'P E O P L E '[(Math.random() * 12) | 0],
  ).join``,
  border: false,
  markdown: true,
})

let PARAMS = {
  strokeWeight: 0.1,
  moduleSize: 2,
  contourDensity: 0.8,
  zoom: 1,
}
pane
  .addInput(PARAMS, 'strokeWeight', {min: 0, max: 1, label: 'Weight'})
  .on('change', () => {
    updateStrokeWeight()
  })
pane
  .addInput(PARAMS, 'moduleSize', {min: 0.1, max: 20, label: 'Size'})
  .on('change', () => {
    resizeModule()
    updateStrokeWeight()
    updateShapes()
    drawShapes()
  })
// pane.addInput(PARAMS, 'zoom', {min: 0.1, max: 10}).on('change', () => {
// })
pane
  .addInput(PARAMS, 'contourDensity', {min: 0, max: 1, label: 'Density'})
  .on('change', () => {
    updateShapes()
    drawShapes()
  })
pane.addButton({title: 'Randomize density'}).on('click', () => {
  seed = Math.random() * 888
  updateShapes()
  drawShapes()
})
pane.addButton({title: 'Save SVG'}).on('click', () => {
  // updateShapes('noBrush')
  updateShapes('noBrush')
  drawShapes()
  saveSVG(svg, 'PEOPLE.svg')
})

const folder = pane.addFolder({
  title: 'What is it and how it works',
  expanded: false,
})
const helpText = `
**Hi! This is a design tool. It makes graphics. For example, typographics. And saves it in SVG format.**

# Inspiration
The thing is based on the typographic composition <a href="https://www.instagram.com/p/CevtKVQLrid/?igsh=a3VpbHg0cmVmYnE5">PEOPLE</a> by Denis Bashev.

# Controls
Press A…Z to switch letters.

Press dot to draw square by square.

Hold _shift_ to erase

Drag mouse to pan

Scroll to zoom.

When you save an SVG, it includes all the shapes, but some of them may be outside the viewport.

At low _density_, some lines will be invisible. You can get them back in your favorite SVG editor.
—

# Lorem Ipsum

The text in this sidebar is illegible. Here is a bit of Lorem Ipsum so you can make sure of this:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel mi elit. Sed vitae nunc id magna dictum sodales. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque massa felis, cursus nec risus vehicula, euismod efficitur massa. Donec gravida viverra erat eget finibus. Maecenas venenatis quam ut nisi luctus, sed fermentum erat mattis. Proin at metus interdum, congue massa tristique, eleifend ante. Donec condimentum massa et tellus congue, eget aliquam sem consequat. Sed sit amet consequat libero, ut faucibus ligula. Nam sodales tempor quam, at consequat tortor. Donec ipsum nunc, maximus sed enim dapibus, convallis aliquet felis. Etiam ut ante turpis.

Aliquam aliquam mi eleifend faucibus suscipit. In eget erat a dolor faucibus cursus tempor a augue. Maecenas sit amet dapibus lectus, eget congue nulla. Praesent semper vel nisl sit amet elementum. Nullam tincidunt nisi sit amet nunc cursus ultrices. Maecenas nisl massa, fringilla at velit sed, feugiat congue lacus. Cras finibus enim ut nibh tincidunt posuere a nec lorem. Praesent lobortis a nibh id tempor. Vivamus venenatis nisl et enim porttitor, at tristique erat faucibus. Ut justo magna, sollicitudin lobortis ultrices quis, condimentum vitae nibh. Sed ut lorem neque. In ut eros velit. Sed at velit iaculis, fringilla metus vel, ullamcorper urna. Nullam consectetur nisi eget diam scelerisque, et iaculis enim vehicula. Praesent ultrices dolor sem, a consectetur magna aliquam in. Sed eget pellentesque ante, a mollis mauris.

Phasellus vitae lorem feugiat leo placerat congue sit amet eu turpis. Aenean efficitur bibendum dictum. Sed at odio bibendum lorem ullamcorper porttitor. Sed sed gravida nibh, porta cursus quam. Ut non semper sem. Fusce ut euismod quam. Vestibulum dui ante, gravida non volutpat eget, finibus non nulla. Aliquam ultrices scelerisque lorem, sed varius nisl. Maecenas iaculis nunc in velit tempor commodo. Nunc non quam ligula. Morbi in pharetra nulla.

Suspendisse facilisis est ac justo congue tincidunt. Nullam suscipit tempus volutpat. Nunc aliquam efficitur quam eget pretium. Duis ex tortor, luctus et fermentum ut, eleifend ac nisl. Pellentesque ultricies odio et bibendum tempor. Nulla iaculis nec enim eget dictum. Nulla quis urna porttitor, lobortis sapien in, efficitur libero. Sed eleifend vehicula felis, vel efficitur sem molestie et.

Donec fringilla vulputate libero non aliquam. Sed eget accumsan leo, sit amet ullamcorper ipsum. Quisque consectetur libero at rhoncus lacinia. Quisque et posuere tellus. Etiam ac viverra mauris. Pellentesque porta lorem ac ultricies porttitor. Sed at mauris in mauris bibendum elementum quis vel lorem. Aliquam libero urna, rhoncus a porta quis, imperdiet eget sapien. Proin sit amet vulputate tellus. Sed libero enim, molestie vitae varius sit amet, commodo quis nibh. Nunc posuere ipsum ultrices nunc sagittis lobortis. Maecenas ut dui tellus. Morbi mollis lacus nec fermentum suscipit.
`
folder.addBlade({
  view: 'infodump',
  content: helpText,
  border: false,
  markdown: true,
})

//}}}

let svg = document.querySelector('svg')
let seed = 100
let viewportOrigin = [0, 0]
let gOrigin = [0, 0]
let [mouseX, mouseY] = [0, 0]
let sqr = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

let N = 40
let gridSize = 15
let width = N * gridSize // / Math.sqrt(2)
let height = 800
// let g = F(N, j => F(N, i => (R() > 0.02 ? undefined : 'F')))
// checkmate
// let g = F(N, j => F(N, i => ((i + j) % 8 === 0 ? 'F' : undefined)))
let g = F(N, _ => F(N, _ => undefined))
let currentLetter = '.'
let moduleTranslated

let shapes = [[], [], [], []]
let brush

function resizeModule() {
  brush = [
    sscale([sqr], (0.999 * gridSize * PARAMS.moduleSize * PARAMS.zoom * 0.5) / 4),
    sscale([sqr], (0.999 * gridSize * PARAMS.moduleSize * PARAMS.zoom * 1.5) / 4),
    sscale([sqr], (0.999 * gridSize * PARAMS.moduleSize * PARAMS.zoom * 2.5) / 4),
    sscale([sqr], (0.999 * gridSize * PARAMS.moduleSize * PARAMS.zoom * 3.5) / 4),
  ]
}
resizeModule()

function drawShapes() {
  svg.innerHTML = ''
  shapes.map(s => drawShape(s))
}

function updateShapes(mode) {
  let gJustFilled = F(g.length, j => F(g[0].length, i => 0))
  shapes = [[], [], [], []]

  let letterMatrix = abc[currentLetter]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  mouseI -= (letterMatrix[0].length / 2) | 0
  mouseJ -= (letterMatrix.length / 2) | 0

  for (let j = 0; j < g.length; j++) {
    for (let i = 0; i < g[0].length; i++) {
      let I = i // + j
      let J = j // - i
      I -= mouseI
      J -= mouseJ
      ;[I, J] = [I / 2, J / 2]
      ;[I, J] = [I - J, J + I]
      if (
        (letterMatrix[J] && letterMatrix[J][I] && mode != 'noBrush') ||
        g[j][i]
      ) {
        // so not to run expensive union for them all
        let justFilledIsNear = false
        let R = Math.ceil(PARAMS.moduleSize * 2)
        for (let k = -R; k <= R; k++) {
          for (let l = -R; l <= R; l++) {
            if (j + k < 0 || j + k >= g.length) continue
            if (i + l < 0 || i + l >= g[0].length) continue
            if (gJustFilled[j + k][i + l] == 1) {
              justFilledIsNear = true
            }
          }
        }
        // if (true) {
        if (justFilledIsNear) {
          unionModuleWithShapes(i, j)
        } else {
          appendModuleToShapes(i, j)
        }
        gJustFilled[j][i] = 1
      }
    }
  }
}

function unionModuleWithShapes(i, j) {
  let [x, y] = ij2xy(i, j)
  moduleTranslated = brush.map(s => strans(s, [x, y]))
  shapes = shapes.map((s, i) => unionShapes(s, moduleTranslated[i]))
}

function appendModuleToShapes(i, j) {
  let [x, y] = ij2xy(i, j)
  moduleTranslated = brush.map(s => strans(s, [x, y]))
  shapes = shapes.map((s, i) => s.concat(moduleTranslated[i]))
}

function xy2ij(x, y) {
  let X = x + viewportOrigin[0]
  let Y = y + viewportOrigin[1]
  X /= PARAMS.zoom
  Y /= PARAMS.zoom
  // X -= width / 2
  // Y -= height / 2
  // ;[X, Y] = rot(X, Y, PI / 4)
  // ;[X, Y] = vmul([X, Y], 1 / Math.sqrt(2))
  // X += width / 2
  // Y += height / 2
  let i = Math.floor(X / gridSize + 0.5) - gOrigin[0]
  let j = Math.floor(Y / gridSize + 0.5) - gOrigin[1]
  return [i, j]
}

function ij2xy(i, j) {
  i += gOrigin[0]
  j += gOrigin[1]
  let x = i * gridSize * PARAMS.zoom - viewportOrigin[0]
  let y = j * gridSize * PARAMS.zoom - viewportOrigin[1]
  return [x, y]
}

function unionShapes(shape1, shape2) {
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

  return resultShape
}

function drawShape(shape) {
  for (let c of shape) {
    let hash = getCountourHash(c)
    setSeed(seed + hash)
    if (R() > PARAMS.contourDensity) {
      continue
      drawContour(c, 0)
    } else {
      drawContour(c, 1)
    }
  }
}

function getCountourHash(c) {
  // let sum = 0
  // c.map(p => p.map(x => (sum += x)))
  return (
    (c[0][0] + viewportOrigin[0]) * 222222 +
    (c[0][1] + viewportOrigin[1]) * 111111
  )
}

function drawContour(contour, opacity = 1) {
  let path = '<path d="'
  for (let i = 0; i < contour.length; i++) {
    if (i == 0) {
      path += `M ${contour[i][0]} ${contour[i][1]} `
    } else {
      path += `L ${contour[i][0]} ${contour[i][1]} `
    }
  }
  path += `Z" `
  if (opacity != 1) path += `opacity="${opacity}" `
  path += ' />'
  // add to the SVG
  svg.innerHTML += path
}

document.onmousemove = e => {
  ;[mouseX, mouseY] = [e.clientX, e.clientY]
  let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
  gExtend(mouseI, mouseJ)
  updateShapes()
  drawShapes()
}

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
  svg.setAttribute(
    'stroke-width',
    ((PARAMS.strokeWeight * PARAMS.moduleSize * PARAMS.zoom) / 4) * gridSize,
  )
}

// print g
updateShapes()
shapes.forEach(s => {
  s.forEach(c => {})
})
drawShapes()

function saveSVG(svgElement, fileName) {
  const svgContent = svgElement.outerHTML

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

//////////////////////

const drugThreshold = 5

let isDown = false
let startX,
  startY,
  prevX,
  prevY,
  divs = []

function handleMouseDown(e) {
  startX = e.clientX || e.touches[0].clientX
  startY = e.clientY || e.touches[0].clientY
  prevX = startX
  prevY = startY
  isDown = true
}

function handleMouseMove(event) {
  if (isDown) {
    let currentX = event.clientX || event.touches[0].clientX
    let currentY = event.clientY || event.touches[0].clientY
    viewportOrigin[0] -= currentX - prevX
    viewportOrigin[1] -= currentY - prevY
    prevX = currentX
    prevY = currentY
  }
}

function handleMouseUp(e) {
  isDown = false
  let endX = e.clientX || e.changedTouches[0].clientX
  let endY = e.clientY || e.changedTouches[0].clientY
  if (Math.hypot(endX - startX, endY - startY) < drugThreshold) {
    let letterMatrix = abc[currentLetter]
    let [mouseI, mouseJ] = xy2ij(mouseX, mouseY)
    mouseI -= (letterMatrix[0].length / 2) | 0
    mouseJ -= (letterMatrix.length / 2) | 0
    for (let j = 0; j < letterMatrix.length; j++) {
      for (let i = 0; i < letterMatrix[j].length; i++) {
        let I = i + j
        let J = j - i
        if (letterMatrix[j][i]) {
          if (e.shiftKey) {
            g[J + mouseJ][I + mouseI] = undefined
          } else {
            gExtend(I + mouseI, J + mouseJ)
            g[J + mouseJ][I + mouseI] = currentLetter
          }
        }
      }
    }
    updateShapes()
    drawShapes()
  }
}

function gExtend(i, j) {
  let margin = 8
  // if i>g[0].length, add more columns
  if (i >= g[0].length) {
    let di = i - g[0].length
    g.forEach(row => {
      for (let k = 0; k < di + margin; k++) {
        row.push(undefined)
      }
    })
  }
  // if j>g.length, add more rows
  if (j >= g.length) {
    let dj = j - g.length
    for (let k = 0; k < dj + margin; k++) {
      g.push(F(g[0].length, () => undefined))
    }
  }
  // if i<0, add more columns on the left
  if (i < 0) {
    let di = Math.abs(i)
    g.forEach(row => {
      for (let k = 0; k < di + margin; k++) {
        row.unshift(undefined)
      }
    })
    gOrigin[0] -= di + margin
  }
  // if j<0, add more rows
  if (j < 0) {
    let dj = Math.abs(j)
    for (let k = 0; k < dj + margin; k++) {
      g.unshift(F(g[0].length, () => undefined))
    }
    gOrigin[1] -= dj + margin
  }
}

function handleMouseLeave() {
  isDown = false
}

// Attach event listeners for mouse events
svg.addEventListener('mousedown', handleMouseDown)
svg.addEventListener('mousemove', handleMouseMove)
svg.addEventListener('mouseup', handleMouseUp)
svg.addEventListener('mouseleave', handleMouseLeave)

// Attach event listeners for touch events
svg.addEventListener('touchstart', handleMouseDown)
svg.addEventListener('touchmove', handleMouseMove)
svg.addEventListener('touchend', handleMouseUp)
svg.addEventListener('touchcancel', handleMouseLeave)

// scroll with wheel, consider mouseX and mouseY
svg.addEventListener('wheel', e => {
  if (e.deltaY > 0) {
    viewportOrigin[0] += mouseX
    viewportOrigin[1] += mouseY
    PARAMS.zoom *= 1.1
    viewportOrigin[0] *= 1.1
    viewportOrigin[1] *= 1.1
    viewportOrigin[0] -= mouseX
    viewportOrigin[1] -= mouseY
  } else {
    viewportOrigin[0] += mouseX
    viewportOrigin[1] += mouseY
    PARAMS.zoom /= 1.1
    viewportOrigin[0] /= 1.1
    viewportOrigin[1] /= 1.1
    viewportOrigin[0] -= mouseX
    viewportOrigin[1] -= mouseY
  }
  resizeModule()
  updateStrokeWeight()
  updateShapes()
  drawShapes()
})

document.addEventListener('keydown', e => {
  // if in abc, set as current letter
  if (Object.keys(abc).includes(e.key.toUpperCase())) {
    currentLetter = e.key.toUpperCase()
    updateShapes()
    drawShapes()
  }
})
