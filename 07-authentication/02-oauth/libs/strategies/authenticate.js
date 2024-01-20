const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, 'Email не указан');
  }

  let user = await User.findOne({email: email});

  if (!user) {
    user = await User.create({
      email: email,
      displayName: displayName,
    });
  }

  return done(null, user);
};
