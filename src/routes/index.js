const Router = require('koa-router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const send = require('koa-send');

const sequelize = require('../config/db/db');
const User = require('../model/user');
const Cours = require('../model/cours');
const Url = require('../model/url');
const Subscription = require('../model/subscription');

const saltRounds = 10;
const secret = require('../config/secret');

const router = new Router();

router.get('/', async (ctx, next) => {
  await send(ctx, ctx.path, { root: `src/public/index.html` });
  next();
});

// login----------------------------------------
router.post('/login', async (ctx, next) => {
  const [res] = [ctx.request.body];

  try {
    if (!res.login) {
      console.log('not login');
      ctx.status = 500;
      ctx.body = { message: 'not login' };
      return;
    }
    if (!res.password) {
      console.log('not password');
      ctx.status = 500;
      ctx.body = { message: 'not password' };
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
        ctx.body = { message: 'error password' };
        return 'error password';
      });
      return res1;
    });
    if ((await user).length <= 0) {
      ctx.status = 500;
      ctx.body = { message: 'not user' };
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
    ctx.status = 200;
    ctx.body = { user: await user, token: tokenID };
    next();
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { message: 'error login' };
  }
});

// findUser-----------------------------------------
router.post('/findUser', async (ctx, next) => {
  try {
    const user = User.findAll({
      where: { login: ctx.UserID },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues;
      });
      return res1;
    });
    console.log(await user);
    ctx.startus = 200;
    ctx.body = await user;
    next();
  } catch (error) {
    console.log(error);
    ctx.startus = 500;
    ctx.body = { message: 'error login' };
  }
});

// addUser-----------------------------------------
router.post('/addUser', async (ctx, next) => {
  const [res] = [ctx.request.body];

  try {
    if (!res.login) {
      console.log('not login');
      ctx.status = 500;
      ctx.body = { message: 'not login' };
      return;
    }
    if (!res.password) {
      console.log('not password');
      ctx.status = 500;
      ctx.body = { message: 'not password' };
      return;
    }
    if (!res.firstName) {
      console.log('not firstName');
      ctx.status = 500;
      ctx.body = { message: 'not firstName' };
      return;
    }
    if (!res.lastName) {
      console.log('not lastName');
      ctx.status = 500;
      ctx.body = { message: 'not lastName' };
      return;
    }
    if (!res.eMail) {
      console.log('not eMail');
      ctx.status = 500;
      ctx.body = { message: 'not eMail' };
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
      ctx.body = { message: 'user add', token: tokenID };
    } else {
      console.log('user in db');
      ctx.status = 500;
      ctx.body = { message: 'user login db' };
    }
    next();
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { message: 'user login db' };
  }
});
// addCourse ---------------------------------------
router.post('/addCourse', async (ctx, next) => {
  const [res] = [ctx.request.body];
  console.log(ctx.UserID);
  try {
    let aaa = [];
    let iduser = '';
    // let fff;
    let name = '';
    const user = User.findAll({ where: { login: ctx.UserID } }).then(
      project => {
        const res1 = project.map(x => {
          return {
            id: x.dataValues.id,
            firstName: x.dataValues.firstName,
          };
        });
        return res1;
      },
    );

    aaa = await user;

    iduser = aaa[0].id;
    name = aaa[0].firstName;
    console.log(aaa[0].firstName);

    ctx.body = { curs_add: res.name };
    if (!res.name) {
      console.log('not name');
      ctx.status = 500;
      ctx.body = { message: 'not name' };
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
          imgUrl: res.imgUrl,
          teacher: name,
          ratingStar: res.ratingStar,
          ratingVotes: res.ratingVotes,
          price: res.price,
          priceDiscount: res.priceDiscount,
          description: res.description,
        });
        return x;
      });
    } else {
      console.log('course in db');
      ctx.status = 500;
      ctx.body = { message: 'course in db' };
    }
    // }
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { message: 'error token' };
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
        return {
          id: x.dataValues.id,
          idUser: x.dataValues.idUser,
          name: x.dataValues.name,
          imgUrl: x.dataValues.imgUrl,
          teacher: x.dataValues.teacher,
          ratingStar: x.dataValues.ratingStar,
          ratingVotes: x.dataValues.ratingVotes,
          price: x.dataValues.price,
          priceDiscount: x.dataValues.priceDiscount,
          description: x.dataValues.description,
        };
        //    return x.dataValues;
      });
      return res1;
    });
    console.log(await curs);
    ctx.body = { courses: await curs };
    return;
  } catch (error) {
    console.log('not course');
    ctx.status = 500;
    ctx.body = { message: 'not course' };
  }
  next();
});

// delUser -----------------------------------------
router.post('/delUser', async (ctx, next) => {
  console.log(ctx.UserID);

  try {
    let userLogin = '';
    const user = User.findAll({ where: { login: ctx.UserID } }).then(
      project => {
        const res1 = project.map(x => {
          return x.dataValues.login;
        });
        return res1;
      },
    );
    userLogin = await user;
    console.log(userLogin);
    if ((await user).length >= 1) {
      console.log((await user).length);
      console.log('user delet');
      ctx.status = 200;
      ctx.body = { message: 'user delet' };
      User.destroy({ where: { login: userLogin } }).then(project => {
        return project;
      });
    } else {
      console.log('not user');
      ctx.status = 500;
      ctx.body = { message: 'not user' };
      return;
    }
  } catch (error) {
    console.log('not user');
    ctx.status = 500;
    ctx.body = { message: 'not user' };
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
    ctx.body = { message: 'not course' };
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
          idUser: x.dataValues.idUser,
          name: x.dataValues.name,
          imgUrl: x.dataValues.imgUrl,
          teacher: x.dataValues.teacher,
          ratingStar: x.dataValues.ratingStar,
          ratingVotes: x.dataValues.ratingVotes,
          price: x.dataValues.price,
          priceDiscount: x.dataValues.priceDiscount,
          description: x.dataValues.description,
        };
      });
      return res1;
    });
    if ((await curs).length === 0) {
      console.log('not id in db');
      ctx.status = 500;
      ctx.body = { message: 'not id in db' };
      return;
    }
    console.log(await curs);
    ctx.status = 200;
    ctx.body = { message: await curs };
    return;
  } catch (error) {
    console.log('not course');
    ctx.status = 500;
    ctx.body = { message: 'not course' };
  }

  next();
});
// urlForCourse -----------------------------------------
router.post('/urlForCourse', async (ctx, next) => {
  const [res] = [ctx.request.body];
  console.log(res);

  try {
    let CourseID = '';
    if (!res.id) {
      console.log('not id');
      ctx.status = 500;
      ctx.body = { message: 'not id' };
      return;
    }
    if (!res.url) {
      console.log('not url');
      ctx.status = 500;
      ctx.body = { message: 'not url' };
      return;
    }

    const curs = Cours.findAll({ where: { id: res.id } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });

    console.log(await curs);
    console.log((await curs).length);
    CourseID = await curs;

    ctx.body = { message: `add url fot id: ${await curs}` };
    if ((await curs).length === 1) {
      console.log(CourseID);
      ctx.status = 200;
      sequelize.sync().then(x => {
        Url.create({
          url: res.url,
          idCourse: CourseID,
        });
        return x;
      });
    } else {
      console.log('not id in db');
      ctx.status = 500;
      ctx.body = { message: 'not id in db' };
      return;
    }
  } catch (error) {
    console.log(error);
    console.log('not id in db');
    ctx.status = 500;
    ctx.body = { message: 'not id in db' };
  }
  next();
});
// getUrlById/:id -----------------------------------------
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
      ctx.body = { message: 'not id in db' };
      return;
    }
    console.log(await url);
    ctx.status = 200;
    ctx.body = { message: await url };
  } catch (error) {
    console.log(error);
  }
  next();
});
// updateCourseBiId/:id -----------------------------------------
router.post('/updateCourseById/:id', async (ctx, next) => {
  const [res] = [ctx.request.body];
  const [urlid] = [ctx.request.url];
  const urlID = urlid.split('/')[2];
  try {
    let userID = '';
    const findID = Cours.findAll({
      where: { id: urlID },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });
    console.log((await findID).length);
    if ((await findID).length === 1) {
      userID = await findID;
      console.log(userID);
      ctx.status = 200;
      ctx.body = { message: 'updete ok' };
      sequelize.sync().then(x => {
        Cours.update(
          {
            name: res.name,
            type: res.type,
            category: res.category,
            imgUrl: res.imgUrl,
            teacher: res.teacher,
            ratingStar: res.ratingStar,
            ratingVotes: res.ratingVotes,
            price: res.price,
            priceDiscount: res.priceDiscount,
            description: res.description,
          },
          { where: { id: userID } },
        );
        return x;
      });
    } else {
      ctx.status = 500;
      ctx.body = { message: 'not id db' };
      return;
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'not id db' };
  }
  next();
});
// delCourseById/:id -----------------------------------------
router.post('/delCourseById/:id', async (ctx, next) => {
  const [urlid] = [ctx.request.url];
  const urlID = urlid.split('/')[2];
  console.log(urlID);

  try {
    let CourseID = '';
    const cours = Cours.findAll({ where: { id: urlID } }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });
    CourseID = await cours;
    console.log(CourseID);
    if ((await cours).length === 1) {
      console.log((await cours).length);
      console.log('Course delet');
      ctx.status = 200;
      ctx.body = { message: 'Course delet' };
      Cours.destroy({ where: { id: CourseID } }).then(project => {
        return project;
      });
    } else {
      console.log('not Course');
      ctx.status = 500;
      ctx.body = { message: 'not Course' };
      return;
    }
  } catch (error) {
    console.log('not Course');
    ctx.status = 500;
    ctx.body = { message: 'not Course' };
  }
  next();
});
// subscription/:id -----------------------------------------
router.post('/subscription/:id', async (ctx, next) => {
  const [urlid] = [ctx.request.url];
  const urlID = urlid.split('/')[2];
  console.log(urlID);
  try {
    let resId = '';

    const user = User.findAll({
      where: { login: ctx.UserID },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });
    resId = await user;
    console.log(resId);

    if ((await user).length === 1) {
      const subscription = Subscription.findAll({
        where: { idName: resId, idCous: urlID },
      }).then(project => {
        const res1 = project.map(x => {
          return x.dataValues.idCous;
        });
        return res1;
      });

      let idNames = '';
      let nameTeachere = '';
      let idTeache = '';
      let idCouse = '';
      const cours = Cours.findAll({ where: { id: urlID } }).then(project => {
        const res1 = project.map(x => {
          return {
            idCousr: x.dataValues.id,
            idTeacer: x.dataValues.idUser,
            nameTeacher: x.dataValues.teacher,
          };
        });

        return res1;
      });
      idNames = await user;
      nameTeachere = (await cours)[0].nameTeacher;
      idTeache = (await cours)[0].idTeacer;
      idCouse = (await cours)[0].idCousr;

      console.log((await cours).length);

      if ((await cours).length === 1) {
        if ((await subscription).length === 0) {
          console.log('not problem');
          sequelize.sync().then(x => {
            Subscription.findOrCreate({
              where: {
                idName: idNames,
                idCous: idCouse,
                idTeach: idTeache,
                nameTeacher: nameTeachere,
              },
            });
            return x;
          });
          await [(ctx.status = 200)];
          await [(ctx.body = { message: 'add id user in cousre' })];
        } else {
          console.log('Course in db');
          ctx.status = 500;
          ctx.body = { message: 'Course in db' };
          return;
        }
      } else {
        console.log('Course in db');
        ctx.status = 500;
        ctx.body = { message: 'Course in db' };
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
  next();
});
// getStudentById -----------------------------------------
router.get('/getStudentById', async (ctx, next) => {
  // const [urlid] = [ctx.request.url];
  // const urlID = urlid.split('/')[2];
  // console.log(urlID);
  console.log(ctx.UserID);
  try {
    const user = User.findAll({
      where: { login: ctx.UserID },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });

    console.log(await user);

    const subscription = Subscription.findAll({
      where: { idTeach: await user },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.idTeach;
      });
      return res1;
    });
    ctx.status = 200;
    ctx.body = { idTeacer: await subscription };
    console.log(await subscription);
  } catch (error) {
    console.log(error);
  }

  next();
});
// getTeacherById -----------------------------------------
router.get('/getTeacherById', async (ctx, next) => {
  // const [urlid] = [ctx.request.url];
  // const urlID = urlid.split('/')[2];
  // console.log(urlID);
  console.log(ctx.UserID);

  try {
    const user = User.findAll({
      where: { login: ctx.UserID },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.id;
      });
      return res1;
    });

    console.log(await user);

    const subscription = Subscription.findAll({
      where: { idName: await user },
    }).then(project => {
      const res1 = project.map(x => {
        return x.dataValues.idName;
      });
      return res1;
    });
    ctx.status = 200;
    ctx.body = { idStudent: await subscription };
    console.log(await subscription);
  } catch (error) {
    console.log(error);
  }
  next();
});
module.exports = router;
