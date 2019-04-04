const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

// const path = require('path');

const app = new Koa();

const koaBody = require('koa-body');

const router = require('./routes/index');
const secret = require('./config/secret');
const User = require('../src/model/user');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(koaBody());
app.use(bodyParser());

app.use(async (ctx, next) => {
  const [url] = [ctx.request.url];
  const urlID = url.split('/')[2];
  if (
    ctx.url === '/addUser' ||
    ctx.url === '/' ||
    ctx.url === '/login' ||
    ctx.url === '/top5' ||
    ctx.url === `/getCourseById/${urlID}` ||
    ctx.url === '/urlForCourse ' ||
    ctx.url === `/getUrlById/${urlID}`
  )
    return next();
  const bearer = ctx.request.headers.authorization;
  const tokenBearer = bearer.split(' ');
  const token = tokenBearer[1];
  console.log(token);
  console.log(ctx.request.headers.authorization);

  if (!token) {
    ctx.status = 402;
    return (ctx.body = { mes: 'not token' });
  }
  try {
    jwt.verify(token, secret);
  } catch (err) {
    ctx.status = 401;
    return (ctx.body = { mes: 'not authenticated! (invalid signature)' });
  }
  const decoded = jwt.decode(token, { complete: true });

  User.findAll({
    where: { login: decoded.payload },
  }).then(project => {
    const res1 = project.map(x => {
      return x.dataValues;
    });
    console.log('ok');
    return res1;
  });
  console.log(decoded.payload);
  // ctx.body = decoded.payload;
  ctx.UserID = decoded.payload;
  return next();
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`server work port: ${PORT}`);
});
