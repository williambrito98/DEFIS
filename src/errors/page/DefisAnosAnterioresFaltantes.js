module.exports = class DefisAnosAnterioresFaltantes extends Error {
  constructor (error) {
    super(error)
    this.name = 'DefisAnosAnterioresFaltantes'
    this.message = error
  }
}
