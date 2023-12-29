const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  function tryToUploadFile() {
    const limitStream = new LimitSizeStream({limit: 1024 * 1024});
    const stream = fs.createWriteStream(filepath, {
      flags: 'wx',
    });

    req.pipe(limitStream).pipe(stream);

    req.on('data', (payload) => {
      if (!payload || payload.toString() === '') {
        res.statusCode = 400;
        res.end('Bad request');
      }
    });

    stream.on('error', (err) => {
      console.warn(err);
      if (err.code === 'EEXIST') {
        res.statusCode = 409;
        res.end(`File ${pathname} already exists`);
      } else {
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });

    limitStream.on('error', (err) => {
      console.warn(err);
      if (err.code === 'LIMIT_EXCEEDED') {
        res.statusCode = 413;
        res.end('File is too large');
      } else {
        res.statusCode = 500;
        res.end('Internal server error');
      }
      fs.unlink(filepath, (err) => {
        if (err) {
          console.warn(err);
        }
      });
    });

    stream.on('finish', () => {
      res.statusCode = 201;
      res.end(`Finish. File ${pathname} uploaded`);
    });

    // todo: заменить на close + условие !req.complete или readableEnded у рид. стрима
    req.on('aborted', () => {
      limitStream.destroy();
      stream.destroy();

      fs.unlink(filepath, (err) => {
        if (err) {
          console.warn(err);
        }
      });
    });

    res.on('close', () => {
      limitStream.destroy();
      stream.destroy();
    });
  }

  switch (req.method) {
    case 'POST':

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Bad Request');
      } else {
        tryToUploadFile();
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
