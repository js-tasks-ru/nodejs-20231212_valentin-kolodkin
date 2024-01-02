const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let clients = [];

router.get('/subscribe', async (ctx, next) => {
  console.log('subscribe');

  let promiseResolveFunc = null;

  ctx.body = await (new Promise((resolve) => {
    promiseResolveFunc = resolve;
    clients.push(promiseResolveFunc);
  }));

  ctx.req.on('close', () => {
    const start = clients.indexOf(promiseResolveFunc);

    if (promiseResolveFunc !== null && start >= 0) {
      clients.splice(start, 1);
    }
  });
});

router.post('/publish', async (ctx, next) => {
  console.log('publish');
  console.log(ctx.request.body);

  const message = ctx.request.body.message;
  if (message) {
    clients.forEach(function(promiseResolveFunc) {
      promiseResolveFunc(message);
    });
  }

  ctx.body = 0;

  await next();
});

app.use(router.routes());

module.exports = app;
