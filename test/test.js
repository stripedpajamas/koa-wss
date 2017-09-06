/* global describe, it */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const Koa = require('koa');
const route = require('koa-route');

const websockify = require('../');

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'certs/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certs/server.crt')),
};

describe('should route ws messages seperately', () => {
  const app = websockify(new Koa(), {
    handleProtocols: (protocols) => {
      if (protocols.indexOf('bad_protocol') !== -1) {
        return false;
      }
      return protocols.pop();
    },
  });

  app.ws.use((ctx, next) => {
    ctx.websocket.on('message', (message) => {
      if (message === '123') {
        ctx.websocket.send(message);
      }
    });
    return next();
  });

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/def', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  const server = app.listen();

  it('sends 123 message to any route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/not-a-route`);
    ws.on('open', () => {
      ws.send('123');
    });
    ws.on('message', (message) => {
      assert(message === '123');
      done();
    });
  });

  it('sends abc message to abc route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc`);
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
    });
  });

  it('sends def message to def route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/def`);
    ws.on('open', () => {
      ws.send('def');
    });
    ws.on('message', (message) => {
      assert(message === 'def');
      done();
    });
  });

  it('handles urls with query parameters', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc?foo=bar`);
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
    });
  });

  it('reject bad protocol use wsOptions', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc`, ['bad_protocol']);
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', () => {
      assert(false);
      done();
    });
    ws.on('unexpected-response', () => {
      assert(true);
      done();
    });
  });
});

describe('should route ws secure messages seperately', () => {
  const app = websockify(new Koa(), {
    handleProtocols: (protocols) => {
      if (protocols.indexOf('bad_protocol') !== -1) {
        return false;
      }
      return protocols.pop();
    },
  }, httpsOptions);

  app.ws.use((ctx, next) => {
    ctx.websocket.on('message', (message) => {
      if (message === '123') {
        ctx.websocket.send(message);
      }
    });
    return next();
  });

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/def', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  const server = app.listen();

  it('sends 123 message to any route', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/not-a-route`, {
      rejectUnauthorized: false,
    });
    ws.on('open', () => {
      ws.send('123');
    });
    ws.on('message', (message) => {
      assert(message === '123');
      done();
    });
  });

  it('sends abc message to abc route', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/abc`, {
      rejectUnauthorized: false,
    });
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
    });
  });

  it('sends def message to def route', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/def`, {
      rejectUnauthorized: false,
    });
    ws.on('open', () => {
      ws.send('def');
    });
    ws.on('message', (message) => {
      assert(message === 'def');
      done();
    });
  });

  it('handles urls with query parameters', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/abc?foo=bar`, {
      rejectUnauthorized: false,
    });
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
    });
  });

  it('reject bad protocol use wsOptions', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/abc`, ['bad_protocol'], {
      rejectUnauthorized: false,
    });
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', () => {
      assert(false);
      done();
    });
    ws.on('unexpected-response', () => {
      assert(true);
      done();
    });
  });
});
