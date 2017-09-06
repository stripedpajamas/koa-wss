# koa-wss

:blue_heart: Support `wss://` in your Koa app :blue_heart:

This is a fork/copy of the excellent package [koa-websocket](https://github.com/kudos/koa-websocket/) by Jonathan Cremin, with secure Web Socket functionality added.

Koa's `listen` method just calls `http.createServer(options).listen(...)`, so this calls `https.createServer(options).listen(...)` instead and provides a parameter to pass in the HTTPS options (like the certificate and stuff).

If you don't supply an `httpsOptions` argument, koa-wss will do what koa-websocket does and just use Koa's built-in `listen` method.

See Koa's docs about this [here](http://koajs.com/#application).

## Installation

`npm install koa-wss --save`

## Usage

Example with Let's Encrypt ([the Greenlock package](https://git.daplie.com/Daplie/greenlock-koa)):

```js
const Koa = require('koa');
const greenlock = require('greenlock-express');
const websockify = require('koa-wss');

const le = greenlock.create({
  // all your sweet Let's Encrypt options here
});

// the magic happens right here
const app = websockify(new Koa(), wsOptions, le.httpsOptions);

// async/await is of course supported
app.ws.use(async (ctx, next) => {
   // the websocket is added to the context as `ctx.websocket`.
  await bananas();
  ctx.websocket.on('message', function(message) {
    // do something
  });
});

app.listen(3000);
```

Another example:
```javascript
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const route = require('koa-route');
const websockify = require('koa-wss');

// using a local certificate, but whatever you normally put in HTTPS options works here
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, './test/certs/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, './test/certs/server.crt'))
};

// the main event
const app = websockify(new Koa(), {}, httpsOptions);

// Note it's app.ws.use and not app.use
// This example uses koa-route
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

## API
#### websockify(KoaApp, WebSocketOptions, httpsOptions)
The WebSocket options object just get passed right through to the `new WebSocketServer` call.
koa-wss passes in `{ server: httpsServer }` automatically because that's the whole point.

The HTTPS options object gets passed right into `https.createServer(options)`. If you don't specify
these options with your certificate info, it will just set up an HTTP Koa server (the default).


## License
MIT