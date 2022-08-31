import * as pixi from 'pixi.js'
import * as graphics from './graphics/graphics'
import { Direction, GridPosition, importerObject, TrackEntry } from './level/importerObject'

let type = 'WebGL'
if (!pixi.utils.isWebGLSupported()) {
  type = 'canvas'
}

pixi.utils.sayHello(type)

let app = new pixi.Application({})

// size
let resize = () => {
  app.renderer.resize(window.innerWidth - 3, window.innerHeight - 4)
}
resize()
window.addEventListener('resize', resize)

app.renderer.backgroundColor = 0x061639

document.body.appendChild(app.view)

let randomPick = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

let aligned = (a: Direction, b: Direction) => {
  let [c, d] = [a, b].sort()
  return (c === 'bottom' && d === 'top') || (c === 'left' && d === 'right')
}

let setPosition = (g: pixi.Container, position: GridPosition) => {
  g.x += graphics.SQUARE_WIDTH * position.column
  g.y += graphics.SQUARE_WIDTH * position.row
  return g
}

let simpleTrack = (start: Direction, end: Direction) => {
  if (start === end) {
    throw new Error(`encountered equal start and end (${start}) in some level file`)
  }
  if (aligned(start, end)) {
    let result = graphics.road()
    if ([start, end].includes('top')) {
      result.rotation = Math.PI / 2
      result.x += graphics.SQUARE_WIDTH
    }
    return result
  } else {
    let turn = graphics.roadTurn()
    let [c, d] = [start, end].sort()
    if (c + d === 'lefttop') {
    } else if (c + d === 'righttop') {
      turn.rotation = Math.PI / 2
      turn.x += graphics.SQUARE_WIDTH
    } else if (c + d === 'bottomright') {
      turn.rotation = Math.PI
      turn.x += graphics.SQUARE_WIDTH
      turn.y += graphics.SQUARE_WIDTH
    } else {
      turn.rotation = -Math.PI / 2
      turn.y += graphics.SQUARE_WIDTH
    }
    return turn
  }
}

let main = async () => {
  let [levelNumber, alternativeImporterObject] = randomPick(Object.entries(importerObject))
  let [alternativeNumber, importer] = randomPick(Object.entries(alternativeImporterObject))

  console.log('level', levelNumber, alternativeNumber)

  let levelContent = await importer()

  console.log('levelContent', levelContent)

  // draw tracks
  levelContent.tracks.forEach((track) => {
    let result = new pixi.Container()

    let g = simpleTrack(track.start, track.end1)
    setPosition(g, track)
    result.addChild(g)
    if (track.switch === 'true') {
      g = simpleTrack(track.start, track.end2)
      setPosition(g, track)
      result.addChild(g)
    }
    app.stage.addChild(result)
  })

  // draw stations
  levelContent.stations.forEach((entry) => {
    let g = graphics.station(entry.color)
    setPosition(g, entry)
    app.stage.addChild(g)
  })
}

main()