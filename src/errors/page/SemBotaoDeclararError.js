module.exports = class SemBotaoDeclararError extends Error {
  constructor (error) {
    super(error)
    this.name = 'SemBotaoDeclararError'
    this.message = error
  }
}
