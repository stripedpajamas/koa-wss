# koa-wss

This is a fork/copy of the _excellent_ package [koa-websocket](https://github.com/kudos/koa-websocket/) by Jonathan Cremin.
I needed a koa-compatible secure WebSocket package and I couldn't figure out a way to keep the flexibility and simplicity of his code, so I copied and tweaked it.

Koa's `.listen` method just calls `http.createServer(options).listen(...)`, so this calls `https.createServer(options).listen(...)` instead and provides a parameter to pass in the HTTPS options (like the certificate and stuff).

See Koa's docs about this [here](http://koajs.com/#application).

## Installation

`npm install koa-wss --save`

## Usage

```javascript
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const route = require('koa-route');
const websockify = require('koa-wss');

// using a local certificate
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './test/certs/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './test/certs/server.crt'))
};

// the main event
const app = websockify(new Koa(), {}, httpsOptions);

// Note it's app.ws.use and not app.use
app.ws.use(route.all('/test', (ctx, next) => {
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', (message) => {
    // do something with the message from client
    console.log(message);
  });
  return next()
}));

app.listen(3000);

```

With custom WebSocket options:

```js
const Koa = require('koa');
const route = require('koa-route');
const websockify = require('koa-wss');

// using a local certificate
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './test/certs/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './test/certs/server.crt'))
};
const wsOptions = {};

// the magic happens right here
const app = websockify(new Koa(), wsOptions, httpsOptions);

app.ws.use(route.all('/', function* (ctx) {
   // the websocket is added to the context as `this.websocket`.
  ctx.websocket.on('message', function(message) {
    // print message from the client
    console.log(message);
  });
}));

app.listen(3000);
```

## License
MIT