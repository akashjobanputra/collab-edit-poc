const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const { WebsocketProvider } = require('y-websocket');
// const Y = require('yjs');
// import { WebsocketProvider } from 'y-websocket'
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const app = express();
// const wsProvider = new WebsocketProvider('ws://localhost:1234', 'velotio-demo', doc, { WebSocketPolyfill: require('ws') })
// const globalDocs = {};


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;
