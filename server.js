const Hapi = require('hapi')
const Path = require('path')
const Inert = require('inert')

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
})

const client = Hapi.server({
    port: 3002,
    host: 'localhost',
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
})

let speech = {
    value: 'welcome',
    set (val) {
        this.value = val
    }
}
const init = async () => {
    await client.register(Inert)
    client.route({
        path: '/{param*}',
        method: 'GET',
        handler: {
            directory: {
                path: '.',
                index: true,
                defaultExtension: 'html'
            }
        }
    })
    server.route({
        path: '/api/welcome/{name}',
        method: 'GET',
        handler (request) {
            return {
                code: 200,
                success: true,
                data: {
                    msg: `${speech.value} ${request.params.name}`
                }
            }
        }
    })
    server.route({
        path: '/api/speech',
        method: 'POST',
        handler (request) {
            speech.set(request.payload.word)
            return {
                code: 200,
                success: true,
                data: {
                    msg: `speech is *${speech.value}* now`
                }
            }
        }
    })

    await server.start()
    await client.start()
    console.log(`Server running at: ${server.info.uri}`)
}
init()