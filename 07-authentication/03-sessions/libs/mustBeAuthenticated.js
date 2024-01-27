const Session = require('../models/Session');

module.exports = async function mustBeAuthenticated(ctx, next) {
  const header = ctx.request.get('Authorization');

  if (!header) {
    ctx.throw(401, 'Пользователь не залогинен');
  }

  const explodedHeader = header.split(' ');
  if (explodedHeader.length < 2) {
    ctx.throw(400, 'Bad request');
  }

  const session = await Session.findOne({
    token: explodedHeader[1],
  }).populate('user');

  if (!session) {
    ctx.throw(401, 'Неверный аутентификационный токен');
  }

  ctx.user = session.user;

  return next();
};
