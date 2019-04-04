const Router = require('koa-router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const send = require('koa-send');

const sequelize = require('../config/db/db');
const User = require('../model/user');
const Cours = require('../model/cours');
const Url = require('../model/url');

const saltRounds = 10;
const secret = require('../config/secret');

const router = new Router();

router.get('/', async (ctx, next) => {
  await send(ctx, ctx.path, { root: `src/public/index.html` });
  next();
});

// AllCourse----------------------------------------

// login----------------------------------------
router.post('/login', async (ctx, next) => {
  const [res] = [ctx.request.body];
  if (!res.login) {
    console.log('not login');
    ctx.status = 500;
    ctx.body = { mes: 'not login' };
    return;
  }
  if (!res.password) {
    console.log('not password');
    ctx.status = 500;
    ctx.body = { mes: 'not password' };
    return;
  }
  const user = User.findAll({
    where: { login: res.login },
  }).then(project => {
    const res1 = project.map(x => {
      const rez = bcrypt.compareSync(res.password, x.dataValues.password);
      console.log(rez);
      if (rez === true) {
        return x.dataValues;
      }
      ctx.status = 500;
      ctx.body = { mes: 'error password' };
      return 'error password';
    });
    return res1;
  });
  if ((await user).length <= 0) {
    ctx.status = 500;
    ctx.body = { mes: 'not user' };
    return;
  }
  const tokenID = jwt.sign(res.login, secret);
  console.log(await user);
  console.log({ tokenID });
  ctx.status = 200;
  if ((await user).toString() === 'error password') {
    ctx.status = 401;
    ctx.body = { user: await user };
    return;
  }
  ctx.body = { user: await user, token: tokenID };
  next();
});

// findUser-----------------------------------------
router.post('/findUser', async (ctx, next) => {
  const user = User.findAll({
    where: { login: ctx.body },
  }).then(project => {
    const res1 = project.map(x => {
      return x.dataValues;
    });
    return res1;
  });
  console.log(await user);
  ctx.body = await user;
  next();
});

// addUser-----------------------------------------
router.post('/addUser', async (ctx, next) => {
  const [res] = [ctx.request.body];
  if (!res.login) {
    console.log('not login');
    ctx.status = 500;
    ctx.body = { mes: 'not login' };
    return;
  }
  if (!res.password) {
    console.log('not password');
    ctx.status = 500;
    ctx.body = { mes: 'not password' };
    return;
  }
  if (!res.firstName) {
    console.log('not firstName');
    ctx.status = 500;
    ctx.body = { mes: 'not firstName' };
    return;
  }
  if (!res.lastName) {
    console.log('not lastName');
    ctx.status = 500;
    ctx.body = { mes: 'not lastName' };
    return;
  }
  if (!res.eMail) {
    console.log('not eMail');
    ctx.status = 500;
    ctx.body = { mes: 'not eMail' };
    return;
  }
  // if (!res.ident) {
  //   console.log('not ident');
  //   ctx.status = 500;
  //   ctx.body = ['not ident'];
  //   return;
  // }

  const resUser = User.findAll({
    where: { login: res.login },
  }).then(project => {
    const res1 = project.map(x => {
      return x.dataValues;
    });
    return res1;
  });
  console.log((await resUser).length);

  if ((await resUser).length <= 0) {
    const tokenID = jwt.sign(res.login, secret);

    bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(res.password, salt, (error, hash) => {
        if (error) {
          console.log(err);
        }
        console.log(hash);
        sequelize.sync().then(x => {
          User.create({
            login: res.login,
            password: hash,
            firstName: res.firstName,
            lastName: res.lastName,
            eMail: res.eMail,
            // ident: res.ident,
          });
          return x;
        });
      });
    });
    console.log('ok');
    ctx.status = 200;
    ctx.body = { mes: 'user add', token: tokenID };
  } else {
    console.log('user in db');
    ctx.status = 500;
    ctx.body = { mes: 'user login db' };
  }
  next();
});
// addCourse ---------------------------------------
router.post('/addCourse', async (ctx, next) => {
  const [res] = [ctx.request.body];
  console.log(ctx.body);
  try {
    let iduser = '';
    const user = User.findAll({ where: { login: ctx.body } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });
    console.log(await user);
    iduser = await user;
    ctx.body = { curs_add: res.name };
    if (!res.name) {
      console.log('not name');
      ctx.status = 500;
      ctx.body = { mes: 'not name' };
      return;
    }
    if (!res.type) {
      console.log('not type');
      ctx.status = 500;
      ctx.body = { mes: 'not type' };
      return;
    }
    if (!res.category) {
      console.log('not category');
      ctx.status = 500;
      ctx.body = { mes: 'not category' };
      return;
    }

    const resCoser = Cours.findAll({
      where: { name: res.name },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues;
      });
      return res1;
    });
    console.log((await resCoser).length);
    if ((await resCoser).length <= 0) {
      sequelize.sync().then(x => {
        Cours.create({
          name: res.name,
          type: res.type,
          category: res.category,
          idUser: iduser,
        });
        return x;
      });
    } else {
      console.log('course in db');
      ctx.status = 500;
      ctx.body = { mes: 'course in db' };
    }
    // }
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { mes: 'error token' };
  }
  next();
});

// findCourse----------------------------------------
router.get('/findCourse', async (ctx, next) => {
  try {
    console.log(ctx.UserID);
    let iduser = '';
    const user = User.findAll({ where: { login: ctx.UserID } }).then(
      project => {
        const res1 = project.map(x => {
          return x.dataValues.id;
        });
        return res1;
      },
    );

    iduser = await user;
    ctx.body = { user_id: await user };
    console.log(iduser);

    const curs = Cours.findAll({ where: { idUser: iduser } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues;
      });
      return res1;
    });
    console.log(await curs);
    ctx.body = { courses: await curs };
  } catch (error) {
    console.log('not course');
    ctx.status = 500;
    ctx.body = { mes: 'not course' };
  }
  next();
});

// delUser -----------------------------------------
router.post('/delUser', async (ctx, next) => {
  try {
    let userLogin = '';
    const user = User.findAll({ where: { login: ctx.body } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.login;
      });
      return res1;
    });
    userLogin = await user;
    console.log(userLogin);
    if ((await user).length >= 1) {
      console.log((await user).length);
      console.log('user delet');
      ctx.status = 200;
      ctx.body = { mes: 'user delet' };
      User.destroy({ where: { login: userLogin } }).then(project => {
        return project;
      });
    } else {
      console.log('not user');
      ctx.status = 500;
      ctx.body = { mes: 'not user' };
    }
  } catch (error) {
    console.log('not user');
    ctx.status = 500;
    ctx.body = { mes: 'not user' };
  }
  next();
});
// top5 -----------------------------------------
router.get('/top5', async (ctx, next) => {
  try {
    const curs = Cours.findAll({}).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.category;
      });
      return res1;
    });
    let j = 0;
    j = (await curs).length;
    if (j >= 5) j = 5;
    console.log(j);

    const shuffled = (await curs).sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, j);
    console.log(selected);
    ctx.status = 200;
    ctx.body = { courses: selected };
  } catch (error) {
    console.log('not course');
    ctx.status = 500;
    ctx.body = { mes: 'not course' };
  }

  next();
});

// getCourseById -----------------------------------------
router.get('/getCourseById/:id', async (ctx, next) => {
  const { url } = ctx.request;
  const urlID = url.split('/')[2];
  try {
    console.log(urlID);
    const curs = Cours.findAll({ where: { id: urlID } }).then(project => {
      const res1 = project.map(x => {
        return {
          id: x.dataValues.id,
          name: x.dataValues.name,
          type: x.dataValues.type,
          category: x.dataValues.category,
          idUser: x.dataValues.idUser,
        };
      });
      return res1;
    });
    if ((await curs).length === 0) {
      console.log('not id in db');
      ctx.status = 500;
      ctx.body = { mes: 'not id in db' };
      return;
    }
    console.log(await curs);
    ctx.status = 200;
    ctx.body = { mes: await curs };
  } catch (error) {
    console.log('not course');
    ctx.status = 500;
    ctx.body = { mes: 'not course' };
  }

  next();
});

router.post('/urlForCourse', async (ctx, next) => {
  const [res] = [ctx.request.body];
  console.log(res);

  try {
    let CourseID = '';
    if (!res.id) {
      console.log('not id');
      ctx.status = 500;
      ctx.body = { mes: 'not id' };
      return;
    }
    if (!res.url) {
      console.log('not url');
      ctx.status = 500;
      ctx.body = { mes: 'not url' };
      return;
    }

    const curs = Cours.findAll({ where: { id: res.id } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });

    console.log(await curs);
    CourseID = await curs;
    console.log(CourseID);
    ctx.status = 200;
    ctx.body = { mes: await curs };
    if ((await curs).length === 1) {
      sequelize.sync().then(x => {
        Url.create({
          url: res.url,
          idCourse: CourseID,
        });
        return x;
      });
    }
  } catch (error) {
    console.log(error);
    console.log('not id in db');
    ctx.status = 500;
    ctx.body = { mes: 'not id in db' };
  }
  next();
});

router.get('/getUrlById/:id', async (ctx, next) => {
  const [urlid] = [ctx.request.url];
  const urlID = urlid.split('/')[2];
  try {
    const url = Url.findAll({ where: { idCourse: urlID } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.url;
      });
      return res1;
    });
    if ((await url).length === 0) {
      console.log('not id in db');
      ctx.status = 500;
      ctx.body = { mes: 'not id in db' };
      return;
    }
    console.log(await url);
    ctx.status = 200;
    ctx.body = { mes: await url };
  } catch (error) {
    console.log(error);
  }
  next();
});

module.exports = router;
