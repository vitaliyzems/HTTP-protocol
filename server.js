const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 9999;

const requestListener = (req, res) => {
  if (req.url === '/get') {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
      return;
    }
    res.writeHead(200);
    fs.readdir(path.join(__dirname, '/files'), 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal server error');
      }
      res.end(data.join(', '));
    });
    return;
  }

  if (req.url === '/delete') {
    if (req.method !== 'DELETE') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }

    res.writeHead(200);
    res.end('Success!');
    return;
  }

  if (req.url === '/post') {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
    }

    res.writeHead(200);
    res.end('Success!');
    return;
  }

  if (req.url === '/redirect') {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
      return;
    }

    res.writeHead(301);
    res.end('This resource is now permanently available at "/redirected"')
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log('Server started');
});