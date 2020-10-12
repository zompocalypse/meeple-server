require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const boardGamesRouter = require('./boardgames/boardgames-router');
const collectionsRouter = require('./collections/collections-router');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const errorHandler = require('./errorHandler');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());

app.use('/api/boardgames', boardGamesRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

module.exports = app;
