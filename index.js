const fastify = require('fastify')({
  logger: true
})
const fastifyEnv = require('fastify-env')
const bearerAuthPlugin = require('fastify-bearer-auth')
const fsequelize = require('fastify-sequelize')

const schema = {
  type: 'object',
  required: [ 'BOOKMARKS_BEARER_TOKEN' ],
  properties: {
    BOOKMARKS_BEARER_TOKEN: {
      type: 'string'
    }
  }
}

const keys = new Set([process.env.BOOKMARKS_BEARER_TOKEN])

const sequelizeConfig = {
    instance: 'db',
    autoConnect: true,
    dialect: 'sqlite',
    storage: 'db.sqlite'
}


fastify
  .register(fastifyEnv, { schema })
  .register(fsequelize, sequelizeConfig)
  .register(bearerAuthPlugin, {keys})
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