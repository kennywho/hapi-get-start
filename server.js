const Hapi = require('hapi')

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
})

const init = async () => {
    server.route({
        path: '/',
        method: 'GET',
        handler () {
            return 'Hapi world'
        }
    })
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}
init()