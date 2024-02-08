const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;
    if (!token) {
      const err = new Error('anonymous sessions are not allowed');
      next(err);
    }

    const session = await Session.findOne({token});
    if (!session) {
      const err = new Error('wrong or expired session token');
      next(err);
    }

    socket.user = session.user;

    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      const user = socket.user;

      await Message.create({
        date: new Date(),
        text: msg,
        chat: user._id,
        user: user.displayName,
      });
    });
  });

  return io;
}

module.exports = socket;
