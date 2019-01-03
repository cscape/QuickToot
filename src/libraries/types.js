import Utilities from './utilities'
const { genHash } = Utilities

export class Spinner {
  constructor (canvas, options) {
    const defaultOptions = {
      size: 16,
      weight: 4,
      length: 60,
      spinspeed: 45,
      colors: { first: '#00BCF2', second: '#2d89ef' },
      fillCap: 0,
      scale: 1
    }
    this.options = Object.assign({}, defaultOptions, options)
    const scale = options.scale ? options.scale : defaultOptions.scale
    if (scale) {
      this.options.weight = scale * defaultOptions.weight
      this.options.size = scale * defaultOptions.size
    }
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.render()
  }

  radianAngle (angle) {
    return Math.PI / 180 * angle
  }

  frame (angle) {
    let c = this.canvas
    let o = this.options
    let ctx = this.context

    c.width = (o.size + o.weight) * o.scale
    c.height = (o.size + o.weight) * o.scale

    ctx.lineWidth = o.weight * o.scale
    ctx.lineCap = 'none'

    // shadow
    ctx.strokeStyle = o.colors.second
    ctx.beginPath()
    ctx.arc(
      (o.size / 2 * o.scale + ctx.lineWidth / 2),
      (o.size / 2 * o.scale + ctx.lineWidth / 2),
      (o.size / 2) * o.scale,
      this.radianAngle(angle),
      this.radianAngle(angle - o.length),
      false
    )
    ctx.stroke()
    // loading-bar
    const fillCap = o.fillCap
    ctx.lineWidth = o.weight * o.scale
    ctx.strokeStyle = o.colors.first
    ctx.beginPath()
    ctx.arc(
      (o.size / 2 * o.scale + ctx.lineWidth / 2) - (fillCap / 2),
      (o.size / 2 * o.scale + ctx.lineWidth / 2) - (fillCap / 2),
      (o.size / 2) * o.scale,
      this.radianAngle(angle - o.length - 1),
      this.radianAngle(angle + 1),
      false
    )
    ctx.stroke()
  }

  clear () {
    let c = this.canvas
    let ctx = this.context

    ctx.clearRect(0, 0, c.width, c.height)
  }

  get image () {
    let c = this.canvas
    let ctx = this.context

    return ctx.getImageData(0, 0, c.width, c.height)
  }

  render () {
    let spinner = this
    let angle = 0

    setInterval(() => {
      if (angle >= 360) angle = 0
      this.clear()
      this.frame(angle)
      angle += spinner.options.spinspeed / 10
    }, 10)
  }
}

export class RunningTracker extends Array {
  push (...items) {
    // Verifies only action objects are passed through
    items.forEach(action => {
      const properties = ['type', 'objectData', 'hash']
      properties.forEach(property => {
        if (action[property] == null) throw new Error(`Action does not contain ${property} property`)
      })
    })
    super.push(...items)
  }

  get pending () {
    if (this.runningActions == null) return super.length
    else return super.length - this.runningActions.length
  }

  remove (hash) {
    const index = super.findIndex((action) => action.hash === hash)
    if (index === -1) return false
    super.splice(index, 1)
  }
}

export class Action extends Object {
  constructor (type, objectData, hash) {
    super()
    this.type = String(type).toLowerCase()
    this.objectData = objectData
    if (hash) {
      this.hash = hash
    } else {
      let hashVal = ''
      for (let i = 0; i < 64; i++) {
        hashVal += Math.round(Math.random() * 16).toString(16).substr(0, 1)
      }
      this.hash = hashVal
    }
    return this
  }
}

export class Account {
  constructor (domain, client) {
    this.domain = domain
    this.token = null
    this.account = null
    this.accountHash = genHash(64)
    this.ok = false
    return this
  }
}
