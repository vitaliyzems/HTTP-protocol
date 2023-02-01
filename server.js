const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 9999;

const user = {
  id: 123,
  username: 'testuser',
  password: 'qwerty'
};

const requestListener = async (req, res) => {
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
        return;
      }
      res.end(data.join(', '));
    });
    return;
  }

  if (req.url === '/delete') {
    if (req.method !== 'DELETE') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
      return;
    }

    if (req.headers.cookie !== `authorized=true; userID=${user.id}`) {
      res.writeHead(400);
      res.end('Пользователь не авторизован');
      return;
    }

    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = JSON.parse(Buffer.concat(buffers).toString());

    const files = fs.readdirSync(path.join(__dirname, 'files'), 'utf-8');

    if (!files.includes(data.filename)) {
      res.writeHead(400);
      res.end('Файла с таким именем не существует');
      return;
    }

    fs.rmSync(path.join(__dirname, 'files', data.filename));

    res.writeHead(200);
    res.end('Success!');
    return;
  }

  if (req.url === '/post') {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
      return;
    }

    if (req.headers.cookie !== `authorized=true; userID=${user.id}`) {
      res.writeHead(400);
      res.end('Пользователь не авторизован');
      return;
    }

    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = JSON.parse(Buffer.concat(buffers).toString());

    fs.writeFileSync(path.join(__dirname, 'files', data.filename), data.content);

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

  if (req.url === '/auth') {
    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('HTTP method not allowed');
      return;
    }

    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = JSON.parse(Buffer.concat(buffers).toString());

    if (user.username !== data.username || user.password !== data.password) {
      res.writeHead(400);
      res.end("Неверный логин и/или пароль");
      return;
    }

    const date = new Date();
    date.setDate(date.getDate() + 2);

    res.statusCode = 200;
    res.setHeader(
      'Set-Cookie',
      [
        `authorized=true; expires=${date.toUTCString()}`,
        `userID=${user.id}; expires=${date.toUTCString()}`
      ]
    );
    res.end("Данные успешно получены");
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log('Server started');
});