const fastify = require('fastify')({
  logger: true
})
const fsequelize = require('fastify-sequelize')

const sequelizeConfig = {
    instance: 'db',
    autoConnect: true,
    dialect: 'sqlite',
    storage: 'db.sqlite'
}


fastify
  .register(fsequelize, sequelizeConfig)
  .register(require('./bookmark'))
  .ready()

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()