var image = new Image()
var ratio = window.devicePixelRatio || 1
var canvas = document.querySelector('#testCanvas')
var context = canvas.getContext('2d')

const SQUARE_MAX_WIDTH = 512
const BASE_COLOR = [255, 255, 255]
const GRADIENT_DISTANCE_MX = 3

let grDistance = 0

const GRADIENTS = [
  // [255, 185, 0],
  // [0, 204, 106],
  // [156, 137, 233],
  // [238, 127, 173],
  // [247, 137, 74]
  [231, 72, 86],
  [255, 241, 0]
]

const toStringRGB = rgb => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`

const drawBaseOverlay = () => context.drawImage(image, 0, 0, canvas.iw, canvas.ih)

// fix this up
const stopGradient = () => {
  const { iw, ih } = canvas
  context.clearRect(0, 0, iw, ih)
  drawGradientBlock(drawGradient(grDistance))
  context.globalAlpha = 0.2
  context.fillStyle = toString(BASE_COLOR)
  context.arc(iw / 2, ih / 2, iw / 3, 0, 360)
  context.fill()
  context.globalAlpha = 1.0
  drawBaseOverlay()
}

const drawGradientBlock = (grd) => {
  const { iw, ih } = canvas
  context.beginPath()
  context.fillStyle = grd
  context.arc(iw / 2, ih / 2, iw / 3, 0, 360)
  context.fill()
}

const drawBlock = grd => {
  context.clearRect(0, 0, canvas.iw, canvas.ih)
  drawGradientBlock(grd)
  drawBaseOverlay()
}

// jesus christ
const drawGradient = (rlDistance) => {
  const gradients = Array(...GRADIENTS)
  gradients.push(GRADIENTS[0], GRADIENTS[1])

  const { iw } = canvas
  const stops = gradients.length
  const blockDistance = iw * GRADIENT_DISTANCE_MX
  const width = stops * blockDistance
  const virtualWidth = blockDistance * (stops - 2)
  const distance = rlDistance != null ? rlDistance % virtualWidth : 0
  grDistance = rlDistance % virtualWidth
  const x1 = -distance
  const x2 = width - distance
  const grd = context.createLinearGradient(x1, 0, x2, 0)

  for (let i = 0; i < stops; i += 1) {
    const pt = (i * blockDistance) / width
    grd.addColorStop(pt, toStringRGB(gradients[i]))
  }

  return grd
}

const animateGradient = () => {
  const { iw } = canvas
  const stops = GRADIENTS.length

  let i = 0
  setInterval(() => {
    drawBlock(drawGradient(i))
    i += 10
  }, 50)
}

image.onload = () => {
  const iw = Math.min(image.width, SQUARE_MAX_WIDTH)
  const ih = Math.min(image.height, SQUARE_MAX_WIDTH)
  canvas.iw = iw
  canvas.ih = ih
  canvas.style.width = iw + 'px'
  canvas.style.height = ih + 'px'
  canvas.width = iw
  canvas.height = ih
  canvas.width *= ratio
  canvas.height *= ratio
  context.scale(ratio, ratio)
  animateGradient()
}

image.src = 'icon-ld.svg'
