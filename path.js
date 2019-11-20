const { range, random } = require('lodash')
const intersection = (a, b) => new Set([...a].filter(x => b.has(x)))

const minMax = (a, b) => ({ min: Math.min(a, b), max: Math.max(a, b) })

/*
  Creates a path from start to end.
  Starting at 'start'
  Travels in x-direction, reaches end.x
  Turns to y-direction, travels until end.y
*/
const createSimplePath = (start, end) => {
  const xBounds = minMax(start.x, end.x)

  const xRange = range(xBounds.min, xBounds.max + 1)

  if (start.x > end.x) {
    xRange.reverse() 
  }

  return [
    ...xRange.map(x => ({ x, y: start.y })),
    ...range(start.y + 1, end.y + 1).map(y => ({ x: end.x, y }))
  ]
}

/*
  Lists all neighbors (within set grid size) for a given location.
*/
const enumerateNeighbors = gridSize => point => {
  const xRange = range(
    Math.max(point.x - 1, 0),
    Math.min(point.x + 1, gridSize.width - 1) + 1
  )

  const yRange = range(
    Math.max(point.y - 1, 0),
    Math.min(point.y + 1, gridSize.height - 1) + 1
  )
  
  const neighbors = new Set()
  const addPoint = p => neighbors.add(pointToKey(p))

  xRange.forEach(x => yRange.forEach(y => addPoint({ x, y })))

  // remove the center
  neighbors.delete(pointToKey(point))
  return neighbors
}

const findAvailableNeighbors = (p1, p2, gridSize, path) => {
  const enumerateOptions = enumerateNeighbors(gridSize)

  const options = intersection(enumerateOptions(p1), enumerateOptions(p2))

  for (const point of path) {
    options.delete(pointToKey(point))
  }

  return [...options].map(k => keyToPoint(k))
}

const pointToKey = point => `${point.x},${point.y}`

const keyToPoint = key => {
  const components = key.split(',')
  return { x: parseInt(components[0]), y: parseInt(components[1]) }
}

const pathRandomizer = (startingPath, desiredLength, gridSize) => {
  const path = startingPath

  while (path.length < desiredLength) {
    const index = random(1, path.length - 1)

    // looking at x-1 and x, find available neighbors
    const availableSlots = findAvailableNeighbors(path[index - 1], path[index], gridSize, path)
    
    if (availableSlots.length === 0) {
      continue
    }
    
    // pick a point p
    const point = availableSlots[random(0, availableSlots.length - 1)]

    // shift x to x+1, place p at x
    path.splice(index, 0, point)
  }

  return path
}

const printPath = (path, gridSize) => {
  const space = new Array(gridSize.width * gridSize.height).fill('-')

  path.forEach((point, index) => space[point.y * gridSize.width + point.x] = `${index}`)

  for (let row=0; row<gridSize.height; row++) {

    const line = []
    for (let column=0; column<gridSize.width; column++) {
      line.push(space[row * gridSize.width + column])
    }
    console.log(line)
  }
}

const gridSize = { width: 4, height: 4 }

const simplePath = createSimplePath({ x: 3, y: 0}, { x: 0, y: 3 })

// printPath(simplePath, gridSize)

const path = pathRandomizer(simplePath, simplePath.length + 3, gridSize)

printPath(path, gridSize)

const rotatePoint = (point, gridSize) => ({ x: point.y, y: gridSize.width - point.x - 1 })
const mirrorXPoint = (point, gridSize) => ({ x: gridSize.width - point.x - 1, y: point.y })
const mirrorYPoint = (point, gridSize) => ({ x: point.x, y: gridSize.height - point.y - 1 })

const applyTransform = transform => (path, gridSize) => path.map(point => transform(point, gridSize))

const rotatePath = applyTransform(rotatePoint)
const mirrorXPath = applyTransform(mirrorXPoint)
const mirrorYPath = applyTransform(mirrorYPoint)