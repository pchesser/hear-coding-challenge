'use strict';
const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const cors = require('cors');
const bodyParser = require('body-parser');

const UserService = require('./data-services/userService').UserService;
const UserRepo = require('./repos/userRepo').UserRepo;
const TimeService = require('./data-services/timeService').TimeService;

nconf.argv().env('__');
nconf.defaults({conf: `${__dirname}/config.json`});
nconf.file(nconf.get('conf'));

const config = nconf.get();
const repo = new UserRepo(config.mongo.connectionString);
const timeService = new TimeService();

const userService = new UserService(repo, null, timeService);
const app = express(); 

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());


require('./controllers/userController.js')(app, config, userService);
app.listen(nconf.get('server').port, () => console.log('ready'));
