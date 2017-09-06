const url = require('url');
const https = require('https');
const compose = require('koa-compose');
const co = require('co');
const ws = require('ws');
const debug = require('debug')('koa:wss');

const WebSocketServer = ws.Server;

function KoaWebSocketServer(app) {
  this.app = app;
  this.middleware = [];
}

KoaWebSocketServer.prototype.listen = function (options) {
  this.server = new WebSocketServer(options);
  this.server.on('connection', this.onConnection.bind(this));
};

KoaWebSocketServer.prototype.onConnection = function (socket) {
  debug('Connection received');
  socket.on('error', (err) => {
    debug('Error occurred:', err);
  });
  const fn = co.wrap(compose(this.middleware));

  const context = this.app.createContext(socket.upgradeReq);
  context.websocket = socket;
  context.path = url.parse(socket.upgradeReq.url).pathname;

  fn(context).catch((err) => {
    debug(err);
  });
};

KoaWebSocketServer.prototype.use = function (fn) {
  this.middleware.push(fn);
  return this;
};

module.exports = (koaApp, wsOptions, httpsOptions = {}) => {
  // the Koa listen function is syntactic sugar for
  // http.createServer(app.callback()).listen(...)
  // here we overwrite for HTTPS
  const app = koaApp;
  app.listen = (...args) => {
    debug('Attaching server...');
    const httpsServer = https.createServer(httpsOptions, app.callback());
    app.server = httpsServer.listen.apply(httpsServer, ...args);
    const options = Object.assign({}, wsOptions, { server: app.server });
    app.ws.listen(options);
    return app.server;
  };
  app.ws = new KoaWebSocketServer(app);
  return app;
};
