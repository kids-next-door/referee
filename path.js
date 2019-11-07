const createSimplePath = (start, end) => {
  let path = []
  for (let x=start.x; x<=end.x; x++) {
    path.push({ x, y: start.y })  
  }
  for (let y=start.y+1; y<=end.y; y++) {
    path.push({ x: end.x, y })
  }
  return path
}

const enumerateNeighbors = gridSize => point => {
  const neighbors = new Set()
  for (let x=Math.max(point.x-1, 0); x<=Math.min(point.x+1, gridSize.width-1); x++) {
    for (let y=Math.max(point.y-1, 0); y<=Math.min(point.y+1, gridSize.height-1); y++) {
      neighbors.add(pointToKey({ x, y }))
    }
  }
  neighbors.delete(pointToKey(point))
  return neighbors
}

const findAvailableNeighbors = (p1, p2, gridSize, path) => {
  const neighborsA = enumerateNeighbors(gridSize)(p1)
  const neighborsB = enumerateNeighbors(gridSize)(p2)

  const options = new Set([...neighborsA].filter(x => neighborsB.has(x)))

  for (const point of path) {
    options.delete(pointToKey(point))
  }

  return options
}

const pointToKey = point => `${point.x},${point.y}`

const keyToPoint = key => {
    const components = key.split(',')
    return { x: parseInt(components[0]), y: parseInt(components[1]) }
}

const pathRandomizer = (simplePath, desiredLength, gridSize) => {
  let path = simplePath

  while (path.length < desiredLength) {
    const index = Math.floor(Math.random() * (path.length - 2) + 1)

    // looking at x-1 and x, find available neighbors
    const availableSlots = findAvailableNeighbors(path[index-1], path[index], gridSize, path)
    
    if (availableSlots.size === 0) {
      continue
    }

    // pick a point p
    const keyChoice = [...availableSlots.keys()][Math.floor(Math.random() * availableSlots.size)]
    const point = keyToPoint(keyChoice)

    // shift x to x+1, place p at x
    path.splice(index, 0, point)

    const prev = path[index-1]
    const next = path[index+1]
    console.log(`adding: ${point.x},${point.y} after: ${prev.x},${prev.y}, before: ${next.x},${next.y}`)
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

const gridSize = { width: 7, height: 5 }

const simplePath = createSimplePath({ x: 0, y: 0}, { x: 1, y: 4 })

// printPath(simplePath, gridSize)

const path = pathRandomizer(simplePath, 10, gridSize)

printPath(path, gridSize)

console.log(path)