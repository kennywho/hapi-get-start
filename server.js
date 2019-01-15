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
    server.route({
        path: '/api/welcome',
        method: 'GET',
        handler (request) {
            return {
                code: 200,
                success: true,
                data: {
                    msg: `welcome ${request.query.name}`
                }
            }
        }
    })
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}
init()