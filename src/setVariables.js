const { existsSync, mkdirSync } = require('fs')
const { join } = require('path')

function createDir (...rest) {
  if (rest.length === 0) {
    return true
  }

  const directory = rest.shift()
  if (!existsSync(directory)) {
    mkdirSync(directory)
  }

  return createDir(...rest)
}

module.exports = (rootDir) => {
  const pathEntrada = join(rootDir, 'entrada')
  const pathTemp = join(rootDir, 'temp')
  const pathSaida = join(rootDir, 'download')

  createDir(pathEntrada, pathSaida, pathTemp)

  global.pathEntrada = pathEntrada
  global.pathTemp = pathTemp
  global.pathSaida = pathSaida
}
