---
title: Hapi.js 起步
---

# {{$page.title}}

## 目录

[[toc]]

## 为什么选择 Hapi

或许你已经使用过 Express, Koa2 等 Node.js 的 WEB 框架，在构建 WEB 应用程序时，你的工作仅仅是产出 RESTFUL API，或者通过 Node 调用其他网络接口。你或许感觉到是不是有一种更简单的方式来处理请求，或在构建项目初期，有没有一种不必因为寻找使用哪个中间件而苦恼的 Node 框架。在对比多个框架后，我选择使用 Hapi 来重构我的 Koa2 项目。

Hapi 目前 Github star 10653，最新版本 17.5，release 版本 18.x。issues 数目 6，对，你没有看错，个位数。可以看出 Hapi 的关注度与维护状态都非常好。可以通过 Hapi 的官网来查看 Hapi 的最新动态，包括提交，修改了哪些 issues，一个简单介绍特性的教程，带有示例的 API 文档，使用 Hapi 的社区，插件和资源。Hapi 具有完整的构建 WEB 应用所需的插件，一些是官方提供的，一些是社区贡献的，而且通常这些插件是可以在任何你想要的地方使用而不依赖于 Hapi，如 Boom, Joi, Catbox。

如果想了解 Hapi，或者它与其他框架的不同，可以在 Google 中搜索相关信息，本文不会过多涉及框架的介绍。

[node-frameworks-to-use](https://scotch.io/bar-talk/10-node-frameworks-to-use-in-2019)

[框架对比](https://hueniverse.com/on-node-framework-popularity-355fbde5cbe4)

[Hapijs](https://hapijs.com)



## 适合什么样的读者

学习本教程，不需要你有任何的 Node 经验，你可以把它当做 Node 的入门课。如果你是一名前端开发人员，本教程会让你更清楚的了解 Node 可以做什么，前后端是如何交付各自工作的。你也可能尝试过其他 Node 框架的新手，你可以通过这个入门教程，来对比两个框架的不同。如果你已经是一名有经验的 Node 开发人员，那么这个教程并不适合你。

这个教程涵盖的概念较少，更多的是动手去尝试，所以哪怕你没有任何经验，你也可以开始学习。

## 准备

+ 安装 node
+ 创建项目
+ 初始化 package.json
+ 编辑器 推荐 vscode
+ 命令行工具 - Windows 推荐 cmder，Mac 推荐 iTerm2
```js
npm init -y
// or
npm init
// -y 参数 以默认方式初始化 package.json
```
+ 安装 Hapi
```js
npm i hapi
// or
npm install hapi -D
// i 为 install 的缩写，不带任何参数时，默认值为 -D
```
## 一个服务

```js
// server.js
const Hapi = require('hapi')

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
})

const init = async () => {
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}
init()
```

在命令行中执行

```bash
node server.js
# Server running at: http://localhost:3000
# 说明我们的服务已经启动了
# 如果 3000 端口已经被占用了， 你可以修改 port 为其他端口
```

现在我们访问 http://localhost:3000，页面会显示 404，因为我们并没有配置任何的`路由`。

## 1. 路由

``` js{4-10}
// server.js

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

```

现在重新启动服务， 我们可以看到页面上的内容了。

接下来我们创建一个 API 接口，可以返回一个 `json` 数据

``` js
// server.js
server.route({
    path: '/api/welcome',
    method: 'GET',
    handler () {
        return {
            code: 200,
            success: true,
            data: {
                msg: 'welcome'
            }
        }
    }
})
```

重启服务，我们访问 http://localhost:3000/api/welcome

我们得到了一个 `content-type` 为 `application/json` 的数据，我们可以通过 `XMLHttpRequest` 的库比如（jQuery Ajax、Axios、Fetch）来请求这个接口，得到一个 JSON 数据

## 2. 停一下

等等，你有没有发现，我们在每次修改文件之后，都要断开服务，手动重启，这样太糟糕了，现在我们要解决这个问题。

```bash
npm i onchange
# 增加 onchange 模块
```

```js
// package.json
"scripts": {
    "dev": "node server.js",
    "watch": "onchange -i -k '**/*.js' -- npm run dev"
},
```

我们在 package.json 文件的 scripts 字段中增加一个 dev 执行。这样，我们执行 `npm run dev` 就相当于执行了之前 `node server.js`。使用 `onchange` 包，监控我的 js 文件变动，当文件发生改变时，重新启动服务。

试一下

```bash
npm run watch
```

然后我们修改一下 api/welcome 的返回结果

刷新一下浏览器

看！不需要手动重启服务了，每次改动，只需要重新刷新浏览器就看到结果了

> <small>现在我们并不需要太早的引入 Nodemon，虽然它非常棒也很好用。</small>

## 3. 参数

既然我们已经可以请求到服务器的数据了，我们还要将客户端的数据传给服务器，下面我们将介绍几种传递参数的形式。

我们假设几个场景，通过这些来理解如何获取参数。

1. `/api/welcome` 我们希望它能返回传入的名字

```js{5,10}
// 修改路由
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
// 请求 http://localhost:3000/api/welcome?name=kenny
// msg: "welcome kenny"
```

2. name 这个参数有些多余，因为这个接口只接受这一个参数，那么现在省略到这个 name

```js{3,10}
// 修改路由
server.route({
    path: '/api/welcome/{name}',
    method: 'GET',
    handler (request) {
        return {
            code: 200,
            success: true,
            data: {
                msg: `welcome ${request.params.name}`
            }
        }
    }
})
// http://localhost:3000/api/welcome/kenny
// msg: "welcome kenny"
// 结果是一样的
```

3. 假设我们需要偶尔更换我们的欢迎词，但不是每次都去修改代码，那么我们需要一个替换欢迎词的接口，通过提交接口来更换欢迎词。

```js
let speech = {
    value: 'welcome',
    set (val) {
        this.value = val
    }
}
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
```
验证一下
```bash
# 使用 curl 来验证一个 POST 接口，你也可以使用 Ajax，POSTMAN...等等 你所喜欢的方式。
curl --form word=你好 \
  http://localhost:3000/api/speech
# {"code":200,"success":true,"data":{"msg":"speech is *你好* now"}}%
curl http://localhost:3000/api/welcome/kenny
# {"code":200,"success":true,"data":{"msg":"你好 kenny"}}%
```

这里需要注意一下，`content-type`  __application/x-www-form-urlencoded__ 与 __multipart/form-data__ 的[区别](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/POST)。

总结一下，可以使用 `request.query` 来获取 url querystring 的数据，`request.payload` 获取 POST 接口的 request body 数据，`request.params` 获取 url 中的自定义参数。

## 4. 第二个服务

我们已经有了一个后端API服务，对应要有一个前端服务，可能这个服务是单页面的，也有可能传统的后端渲染页面，但是通常都是和你后端服务不在同一个端口的。我们创建另一个服务，用来渲染前端页面，为了更真实的模拟真实的场景。

```patch
+const client = Hapi.server({
+    port: 3002,
+    host: 'localhost'
+})
+

-    server.route({
+    client.route({

+    await client.start()
```

增加一个新的服务，监听端口啊 3002，并将之前首页路由修改成 client 的首页。

访问 http://localhost:3002 查看效果

## 5. 静态文件

之前，我们直接渲染页面的方式是字符串，这样不利于编写和修改，我们把返回 HTML 的方式改为”模板“渲染。

```bash
# 安装所需依赖包
npm i inert
# 创建 public 文件夹
mkdir public
# 创建 index.html
touch public/index.html
# 创建 about.html
touch public/about.html
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <title>Document</title>
</head>
<body>
    <h1>Hapi world</h1>
</body>
</html>
```

```js{15}
// ...

const client = Hapi.server({
    port: 3002,
    host: 'localhost',
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
})

// ... 
// const init = async () => {
await client.register(Inert)
client.route({
    path: '/{param*}',
    method: 'GET',
    handler: {
        directory: {
            path: '.',
            index: true,
        }
    }
})

// ...
```

依次访问查看效果

+ http://localhost:3002
+ http://localhost:3002/index.html
+ http://localhost:3002/about.html

__/index.html__ 这种带着扩展名的路径看似不那么专业，我们修改一下 `directory` 的配置

```patch
directory: {
+ defaultExtension: 'html'
```

访问 http://localhost:3002/index 

## 6. 跨域请求

我们不过多介绍浏览器的[同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy),现在已有的客户端（端口3002)在发起 XHRHttpRequest 请求服务端(端口3000)接口时，就会遇到 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS) 问题，接下来我们要在服务端允许来自客户端的请求，通过设置 `Access-Control-Allow-Origin` 等响应头，使跨域请求被允许。

```js
// index.html
$.ajax({
    url: 'http://localhost:3000/api/welcome/kenny'
}).then(function (data) {
    console.log(data)
})
```

访问 http://localhost:3002/index 会报 js 的跨域错误

> <small>Access to XMLHttpRequest at 'http://localhost:3000/api/welcome/kenny' from origin 'http://localhost:3002' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.</small>

```js{5-9}
// server.js
const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        cors: {
            origin: '*'
        }
    }
})
```

保存后，你会发现终端会有以下错误

> <small>[1] "origin" must be an array</small>

这就是 Hapi 的另一个优势，配置检查，因为 Hapi 作为以配置先行的框架，做了很多配置的检查，在你使用了不允许或不规范的配置时，会有相应的错误产生，方便你对于问题的捕捉和解决。

```js
origin: ['*']
```

然后刷新页面，你会发现跨域的错误已经没有了。

关于跨域，我们还没有提及：

+ 允许指定的域名和多个域名
+ 允许携带cookie [Access-Control-Allow-Credentials]
+ 允许获取额外的头部信息 [Access-Control-Expose-Headers]
+ 允许携带的头部信息 [Access-Control-Allow-Headers]

## 7. 还缺什么？

目前我们拥有了一个 web 渲染的前端服务，一个提供接口的后端服务，而且他们是在不同的”域“（端口），前端页面或许有写单调，没有图片和样式，也没有 favicon。

+ 下载一个你喜欢的 favicon 
+ 引入一个本地的 CSS 
+ 引入一个本地的图像

帮他们都放在放在 /public 目录下

```html
...
<head>
...
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/bulma.min.css">
</head>
...
<html>
<img class="logo" src="/logo.svg" />
...
```

## 8. Cookie

假设我们有一个登录 `/login` 接口，在登录成功后，设置一个 login 字段在 cookie 中， 前端可以通过这个 login 来判断你是否登录，并且可以通过 `/logout` 登出。

```js
// ...
server.state('login', {
    ttl: null, // 时效
    isSecure: false, // https
    isHttpOnly: false, // http Only
    encoding: 'none', // encode
    clearInvalid: false, // 移除不可用的 cookie
    strictHeader: true // 不允许违反 RFC 6265
})
// ...
const init = async () => {
// ...
server.route({
    path: '/api/login',
    method: 'POST',
    handler (request, h) {
        let body
        let code
        // 获取 cookie
        const isLogin = request.state.login
        if (isLogin) {
            body = {
                msg: '已登录'
            }
            code = 200
        } else if (request.payload && request.payload.email === 'kenny@gmail.com' && request.payload.password === '123456') {
            // 设置 cookie
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
```

```js
server.route({
    path: '/api/logout',
    method: 'POST',
    handler (request, h) {
        // 取消 cookie
        h.unstate('login')
        return {
            code: 200,
            success: true
        }
    }
})
```

> <small>这个例子并不适合实际的业务场景，只是为了更简单的描述如何设置和取消cookie</small>

## 9. 认证与授权

认证这个概念可能对于入门来说可能比较难以理解，比如比较常用的 [JWT](https://jwt.io/) (JSON Web Token)，这里不浪费时间去解释如何使用，如果想了解什么是JWT，传送门： [Learn how to use JSON Web Tokens (JWT) for Authentication](https://github.com/dwyl/learn-json-web-tokens)。在 Hapi 框架中，我们使用[ hapi-auth-jwt2](https://github.com/dwyl/hapi-auth-jwt2)

这里讲一下 Hapi 中认证配置的方便之处。

在 Express/Koa2 中，你需要

+ 引入插件
+ 中间件处理 401 
+ 中间件中匹配需要认证的路由，和排除不需要的认证路由。

当你项目的路由足够多时，这个匹配规则也会越来越复杂。或者你可以在路由的命名上做一些规划，这让完美主义者感觉很不好。在单个路由内做判断呢，又是重复的操作。

下面看下 Hapi 的使用。

```js
// 引入插件
await server.register(require('hapi-auth-jwt2'))
// 自定义一个你的认证方法
const validate = async function (decoded, request) {
    return {
        isValid: true
    }
}
// 设置认证
server.auth.strategy('jwt', 'jwt', {
    key: 'your secret key',
    validate,
    verifyOptions: {
        algorithms: ['HS256']
    },
    cookieKey: 'token'
})

// 一个需要认证的路由
server.route({
    path: '/user/info',
    method: 'GET',
    options: {
        auth: 'jwt'
    },
    // ...
})
// 一个需要认证可选的路由
server.route({
    path: '/list/recommond',
    method: 'GET',
    options: {
        auth: {
            strategy: 'jwt',
            mode: 'optional'
      }
    },
    // ...
})
// 一个需要认证尝试的路由
server.route({
    path: '/list/recommond',
    method: 'GET',
    options: {
        auth: {
            strategy: 'jwt',
            mode: 'try'
      }
    },
    // ...
})


```
其中 try 与 optional 的区别在于认证错误后的返回， optional 的认证规则为你可以没有，但是有那就必须是正确的。 try 则是无所谓，都不会返回 401 错误。

可以看出，Hapi 中关于认证是配置在路由上的，这使得在管理认证和非认证模块时，只需配置相应规则，而无需担心是否错改了全局的配置。

## 10. 日志

在接受到请求，或者在服务上发起请求时，并没有可以让我们查看的地方，现在加入一个日志系统。

```bash
npm i hapi-pino
```

```js
await server.register({
    plugin: require('hapi-pino'),
    options: {
        prettyPrint: true // 格式化输出
    }
})
```

重新服务，并且访问 '/api/logout'

查看一下终端的显式

```bash
[1547736441445] INFO  (82164 on MacBook-Pro-3.local): server started
    created: 1547736441341
    started: 1547736441424
    host: "localhost"
    port: 3000
    protocol: "http"
    id: "MacBook-Pro-3.local:82164:jr0qbda5"
    uri: "http://localhost:3000"
    address: "127.0.0.1"
Server running at: http://localhost:3000

[1547736459475] INFO  (82164 on MacBook-Pro-3.local): request completed
    req: {
      "id": "1547736459459:MacBook-Pro-3.local:82164:jr0qbda5:10000",
      "method": "post",
      "url": "/api/logout",
      "headers": {
        "cache-control": "no-cache",
        "postman-token": "b4c72a2f-38ab-4c5c-9559-211e0669e6cf",
        "user-agent": "PostmanRuntime/7.4.0",
        "accept": "*/*",
        "host": "localhost:3000",
        "accept-encoding": "gzip, deflate",
        "content-length": "0",
        "connection": "keep-alive"
      }
    }
    res: {
      "statusCode": 200,
      "headers": {
        "content-type": "application/json; charset=utf-8",
        "vary": "origin",
        "access-control-expose-headers": "WWW-Authenticate,Server-Authorization",
        "cache-control": "no-cache",
        "set-cookie": [
          "login=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
        ],
        "content-length": 27
      }
    }
    responseTime: 16

```

可以说非常全面的日志，而且带有着色效果。

## 11. 文档

随着开发的时间，你的项目中加入了越来越多的接口，当你与其他人员配合，或者想找到一个接口的定义时，一个好的文档会让你事倍功半

```js
await server.register({
    plugin: require('lout')
})
```

因为 Hapi 是以配置为中心的框架，所以文档也可以根据配置生成，只需要你对路由进行一定的描述，就会生成一个可用的文档。

访问 http://localhost:3000/docs 查看效果

## 12. 转发接口

未完成

## 如何使用示例

本文提及的内容都已经上传 [github](https://github.com/KennyWho/hapi-get-start)

你可以 clone 项目后查看代码。同时你也可以切换到不同的步骤中(git checkout HEAD)

```bash

# 查看commit
git log --pretty=online

51b2a7eea55817c1b667a34bd2f5c5777bde2601 part 9 api doc
fbb1a43f0f1bf4d1b461c4c59bd93b27aabc3749 Part8 cookies
00a4ca49f733894dafed4d02c5a7b937683ff98c Part7 static
ea2e28f2e3d5ef91baa73443edf1a01a383cc563 Part7 cors
a0caaedbf492f37a4650fdc33d456fa7c6ef46d3 Part6 html render
12fce15043795949e5a1d0d9ceacac8adf0079e8 Part5 client server
79c68c9c6eaa064a0f8c679ae30a8f851117d7e0 Part4 request.payload
e3339ff34d308fd185187a55f599feed1e46753e Part4 request.query
af40fc7ef236135e82128a3f00ec0c5e040d4b12 Part3 restart when file changed
2b4bd9bddfe565fd99c7749224e14cc7752525b1 Part2 route 2
99a8f8426f43fea85f98bc9a3b189e5e3386abfe Part2 route
047c805ca7fe44148bac85255282a4d581b5b8e1 Part1 server
# 切换至 Part5
git checkout 12fce15043795949e5a1d0d9ceacac8adf0079e8
```
## 结尾

目前教程完成度为 80%，因为目前精力有限，暂时更新到这里，后续根据读者的意见和建议会持续更新到一个满意的程度。

再次感谢你的阅读，如果觉得这个教程对你有所帮助，欢迎转发评论。当然也可以打赏一下。

如果你对本教程有更好的建议，请与我联系。