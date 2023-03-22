module.exports = class DefisAntigoError extends Error {
  constructor (error) {
    super(error)
    this.name = 'DefisAntigoError'
    this.message = error
  }
}
