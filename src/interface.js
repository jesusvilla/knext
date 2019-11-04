export default class Interface {
  async connect () {
    // Connect to database
  }

  async execute () {
    // Execute query
  }

  then (resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  catch (reject) {
    return this.execute().catch(reject)
  }
}