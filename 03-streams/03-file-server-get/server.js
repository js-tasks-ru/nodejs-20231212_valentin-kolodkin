const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  function tryToFetchFile() {
    const stream = fs.createReadStream(filepath);

    stream.on('open', () => {
      const mimeType = mime.contentType(path.extname(filepath));

      res.setHeader('Content-Type', mimeType);
    });

    stream.on('error', (err) => {
      console.warn(err);
      let statusCode;
      let message;
      if (err.code === 'ENOENT') {
        statusCode = 404;
        message = 'File not found';
      } else {
        statusCode = 500;
        message = 'Internal server error';
      }

      res.writeHead(statusCode, {
        'Content-Type': 'text/plain',
      });
      res.end(message);
    });

    stream.pipe(res);

    req.on('aborted', () => {
      stream.destroy();
    });

    res.on('close', () => {
      stream.destroy();
    });
  }

  switch (req.method) {
    case 'GET':

      if (pathname.includes('/')) {
        res.writeHead(400, {
          'Content-Type': 'text/plain',
        });
        res.end('Bad Request');
      } else {
        tryToFetchFile();
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
