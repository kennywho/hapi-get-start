# Hapi.js 起步

## 目录

[[toc]]

## 为什么选择 Hapi

或许你已经使用过 Express, Koa2 等 Node.js 的 WEB 框架，在构建 WEB 应用程序时，你的工作仅仅是产出 RESTFUL API，或者通过 Node 调用其他网络接口。你或许感觉到是不是有一种更简单的方式来处理请求，或在构建项目初期，有没有一种不必因为寻找使用哪个中间件而苦恼的 Node 框架。在对比多个框架后，我选择使用 Hapi 来重构我的 Koa2 项目。

Hapi 目前 Github star 10653，最新版本 17.5，release 版本 18.x。issues 数目 6，对，你没有看错，个位数。可以看出 Hapi 的关注度与维护状态都非常好。可以通过 Hapi 的官网来查看 Hapi 的最新动态，包括提交，修改了哪些 issues，一个简单介绍特性的教程，带有示例的 API 文档，使用 Hapi 的社区，插件和资源。Hapi 具有完整的构建 WEB 应用所需的插件，一些是官方提供的，一些是社区贡献的，而且通常这些插件是可以在任何你想要的地方使用而不依赖于 Hapi，如 Boom, Joi, Catbox。

如果想了解 Hapi，或者它与其他框架的不同，可以在 Google 中搜索相关信息，本文不会过多涉及框架的介绍。

[Hapijs](https://hapijs.com)

## 适合什么样的读者

学习本教程，不需要你有任何的 Node 经验，你可以把它当做 Node 的入门课。如果你是一名前端开发人员，本教程会让你更清楚的了解 Node 可以做什么，前后端是如何交付各自工作的。你也可能尝试过其他 Node 框架的新手，你可以通过这个入门教程，来对比两个框架的不同。如果你已经是一名有经验的 Node 开发人员，那么这个教程并不适合你。

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

## 路由

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

现在重新启动服务， 我们可以看到页面上的内容了。

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

我们得到了一个 `content-type` 为 `application/json` 的数据，我们可以通过 `XMLHttpRequest` 的库比如（jQuery Ajax、Axiox、Fetch）来请求这个接口，得到一个 JSON 数据

## 停一下

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

## 参数

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

## 第二个服务

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

## 静态文件

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

## 跨域请求

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

## 还缺什么？

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

## 实战

## Cookie

## 认证

## 数据库

## 爬虫抓取

## 日志

## 文档