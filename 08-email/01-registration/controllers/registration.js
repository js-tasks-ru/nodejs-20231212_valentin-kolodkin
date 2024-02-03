const { v4: uuid } = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');
const Session = require('../models/Session');

module.exports.register = async (ctx, next) => {
  const email = ctx.request.body.email;

  const user = await User.findOne({
    email: email,
  });

  if (user) {
    ctx.response.status = 400;
    ctx.response.body = {
      errors: {
        email: 'Такой email уже существует',
      },
    };

    return;
  }

  const verificationToken = uuid();

  const registeredUser = new User({
    email: email,
    displayName: ctx.request.body.displayName,
    verificationToken: verificationToken,
  });
  await registeredUser.setPassword(ctx.request.body.password);
  await registeredUser.save();

  await sendMail({
    to: email,
    subject: 'Подтверждение регистрации',
    template: 'confirmation',
    locals: {
      token: verificationToken,
    },
  });

  ctx.response.body = {
    status: 'ok',
  };
};

module.exports.confirm = async (ctx, next) => {
  const verificationToken = ctx.request.body.verificationToken;

  const user = await User.findOne({
    verificationToken: verificationToken,
  });

  if (!user) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: 'Ссылка подтверждения недействительна или устарела',
    };
    return;
  }

  await User.findOneAndUpdate({
    verificationToken: verificationToken,
  }, {
    $unset: {
      verificationToken: '',
    },
  });

  const sessionKey = uuid();

  await Session.create({
    user: user._id,
    token: sessionKey,
    lastVisit: new Date(),
  });

  ctx.response.body = {
    status: 'ok',
    token: verificationToken,
  };
};
