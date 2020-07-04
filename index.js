const HOST = process.env.HOST || '127.0.0.1'
const PORT = process.env.PORT || 3000
const BOOKMARKS_BEARER_TOKEN = process.env.BOOKMARKS_BEARER_TOKEN || 'a-super-secret-key'
const DB_STORAGE = process.env.DB_STORAGE || 'data/db.sqlite'
const TRUST_PROXY = process.env.TRUST_PROXY || false

const keys = new Set([BOOKMARKS_BEARER_TOKEN])

const sequelizeConfig = {
    instance: 'db',
    autoConnect: true,
    dialect: 'sqlite',
    storage: DB_STORAGE
}

const fastify = require('fastify')({
  logger: true,
  trustProxy: TRUST_PROXY
})

fastify
  .register(require('fastify-sequelize'), sequelizeConfig)
  .register(require('fastify-cors'))
  .register(require('fastify-bearer-auth'), {keys})
  .register(require('./bookmark'))
  .ready()

const start = async () => {
  try {
    await fastify.listen(PORT, HOST)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()