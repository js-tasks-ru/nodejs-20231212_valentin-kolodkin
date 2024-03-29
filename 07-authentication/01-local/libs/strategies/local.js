const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    // todo: добавить try catch
    async function(email, password, done) {
      const user = await User.findOne({email: email});

      if (!user) {
        return done(null, false, 'Нет такого пользователя');
      }

      if (! (await user.checkPassword(password))) {
        return done(null, false, 'Неверный пароль');
      }

      done(null, user);
    },
);
