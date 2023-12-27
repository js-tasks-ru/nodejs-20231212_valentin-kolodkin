const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  function tryToRemoveFile() {
    fs.unlink(filepath, (err) => {
      if (err === null) {
        res.end(`File ${pathname} was removed`);
      } else {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end(`File ${pathname} not found`);
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
        }
      }
    });
  }

  switch (req.method) {
    case 'DELETE':

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Bad Request');
      } else {
        tryToRemoveFile();
      }

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
