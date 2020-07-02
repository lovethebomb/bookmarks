const tap = require('tap')
const fp = require('fastify-plugin')

const Fastify = require('fastify')
const bearerAuthPlugin = require('fastify-bearer-auth')
const SequelizeMock = require('sequelize-mock');

const BOOKMARKS_BEARER_TOKEN = 'a-super-secret-key'
const keys = new Set([BOOKMARKS_BEARER_TOKEN])

const DBConnectionMock = new SequelizeMock()
const fastifySequelizeMock = fp(function (fastify, opts, done) {
  fastify.decorate('db', DBConnectionMock)
  // fastify.addHook('onClose', (fastifyInstance, done) => {
  //   sequelize.close()
  //     .then(done)
  //     .catch(done)
  // })
  done()
})

const authorizedHeader = {
  'authorization': `Bearer ${BOOKMARKS_BEARER_TOKEN}`
}
const BookmarkMock = {
  'id': '17bc9307-0f76-4f4c-9ff6-ad1bfe6b5da7',
  'description': 'A great sample description',
  'image': 'image.jpg',
  'source': 'Web',
  'title': 'A great title',
  'url': 'https://a-great-url.example',
  'createdAt': '2020-06-27 19:36:41.514 +00:00',
  'updatedAt': '2020-06-27 19:37:41.514 +00:00',
}

const buildFastify = () => {
  const fastify = Fastify()

  fastify
    .register(fastifySequelizeMock)
    .register(bearerAuthPlugin, {keys})
    .register(require('./bookmark'), { mock: BookmarkMock })
    return fastify
  }

async function test() {
  await tap.test('GET `/` route', async t => {
    const fastify = buildFastify()

    t.tearDown(() => fastify.close())
  
    await fastify.ready()

    await t.test('Should reject unauthorized requests', async t => {
      t.plan(2, 'Throw 401 on unauthorized requests')

      try {
        const response = await fastify.inject({
          method: 'GET',
          url: '/',
        })
        t.strictEqual(response.statusCode, 401)
        t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      } catch(err) {
        t.error(err)
      }
      t.end()
    })
    
    await t.test('Should retrieve bookmarks', async t => {
      t.plan(3, 'Retrieve bookmarks')

      try {
        const response = await fastify.inject({
          method: 'GET',
          url: '/',
          headers: {
            ...authorizedHeader
          }
        })
        t.strictEqual(response.statusCode, 200)
        t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
        t.deepEqual(response.json(), { bookmarks: [BookmarkMock] })
      } catch(err) {
        t.error(err)
      }
      t.end()
    })
    t.end()
  })

  await tap.test('POST `/` route', async t => {
    const fastify = buildFastify()

    t.tearDown(() => fastify.close())
  
    await fastify.ready()


    await t.test('Should reject incomplete body', async t => {
      t.plan(3)

      try {
        const response = await fastify.inject({
          method: 'POST',
          url: '/',
          payload: {
            "image": "image.jpg",
            "source": "Source",
            "title": "Sample title"
          },
          headers: {
            ...authorizedHeader,
          }
        })
        t.strictEqual(response.statusCode, 400)
        t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
        t.deepEqual(response.json(), {
          "statusCode": 400,
          "error": "Bad Request",
          "message": "body should have required property 'url'"
        })
      } catch(err) {
        t.error(err)
      }
      t.end()
    })
    t.end()
  })
}
test();