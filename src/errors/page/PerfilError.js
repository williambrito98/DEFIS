module.exports = class PerfilError extends Error {
  constructor (error) {
    super(error)
    this.name = 'PerfilError'
    this.message = error
  }
}
