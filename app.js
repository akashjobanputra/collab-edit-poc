#!/usr/bin/env node
const port = process.env.PORT || 3000
const debug = require('debug')('repo:server');
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
const WebSocketServer = require('ws').Server;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocketServer({server: server});

const path = require('path');
const cookieParser = require('cookie-parser');
const getLogger = require('morgan');

server.on('error', onError);
server.on('listening', onListening);

wss.on('connection', (...args) => {
  console.info('wss:connection');
  setupWSConnection(...args);
});

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log(`Listening on ${bind}`);
  console.log(addr);
}

// server.on('upgrade', (req, socket, head) => {
//   const handleAuth = ws => {
//     console.info('upgrade:handleAuth');
//     wss.emit('connection', ws, req);
//   }
//   // if handleUpgrade is to be called manually, then you need to create WSS with noServer: true
//   // https://github.com/websockets/ws/issues/1787#issuecomment-679692899
//   wss.handleUpgrade(req, socket, head, handleAuth);
// })

server.listen(port);

app.use(getLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
