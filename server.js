const Hapi = require('hapi')
const Path = require('path')
const Inert = require('inert')

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        cors: {
            origin: ['*']
        }
    }
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
server.state('login', {
    ttl: null, // 时效
    isSecure: false, // https
    isHttpOnly: false, // http Only
    encoding: 'none', // encode
    clearInvalid: false, // 移除不可用的 cookie
    strictHeader: true // 不允许违反 RFC 6265
})
const init = async () => {
    await client.register(Inert)
    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: true // 格式化输出
        }
    })
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
        path: '/api/login',
        method: 'POST',
        handler (request, h) {
            let body
            let code
            const isLogin = request.state.login
            if (isLogin) {
                body = {
                    msg: '已登录'
                }
                code = 200
            } else if (request.payload && request.payload.email === 'kenny@gmail.com' && request.payload.password === '123456') {
                h.state('login', 'true')
                body = {
                    msg: '登录成功'
                }
                code = 200
            } else {
                code = 100
                body = {
                    msg: '登录信息有误'
                }
            }
            return {
                code,
                success: true,
                data: body
            }
        }
    })
    server.route({
        path: '/api/logout',
        method: 'POST',
        handler (request, h) {
            h.unstate('login')
            return {
                code: 200,
                success: true
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