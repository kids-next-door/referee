const { generatePath } = require('./path')
const { functions: { validateMove } } = require('./move-validator')

const createIsOnEdge = gridSize => point => {
  const isEdge = x => x === 0 || x === gridSize.width - 1 || x === gridSize.height - 1
  return [point.x, point.y].reduce((result, x) => result || isEdge(x), false)
}

const gridSize = { width: 5, height: 5 }

const isOnEdge = createIsOnEdge(gridSize)

const testGeneratePathShort = () => {
  const path = generatePath(10, gridSize)
  return path.length === 10 && isOnEdge(path[0]) && isOnEdge(path[9])
}

const testGeneratePathLong = () => {
  const path = generatePath(16, gridSize)
  return path.length === 16 && isOnEdge(path[0]) && isOnEdge(path[15])
}

const testValidateMoveGoodStep = () => {
  const path = generatePath(10, gridSize)
  return validateMove(path[0], path[1], path, gridSize)
}

const testValidateMoveFutureStep = () => {
  const path = generatePath(10, gridSize)
  return !validateMove(path[0], path[4], path, gridSize)
}

const testValidateMoveBadStep = () => {
  const path = generatePath(10, gridSize)
  return !validateMove(path[0], { x: 9, y: 9 }, path, gridSize)
}

const allTests = [
  testGeneratePathShort,
  testGeneratePathLong,
  testValidateMoveGoodStep,
  testValidateMoveFutureStep,
  testValidateMoveBadStep,
]

allTests.forEach(test => console.log(test, test() ? 'passed' : 'failed'))