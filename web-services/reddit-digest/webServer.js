'use strict';

const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const cors = require('cors');
const bodyParser = require('body-parser');

const UserService = require('./data-services/userService').UserService;
const UserRepo = require('./repos/userRepo').UserRepo;
const TimeService = require('./data-services/timeService').TimeService;
const RedditService = require('./data-services/redditService').RedditService;
const HttpService = require('./data-services/httpService').HttpService;
const EmailService = require('./data-services/emailService').EmailService;

nconf.argv().env('__');
nconf.defaults({ conf: `${__dirname}/config.json` });
nconf.file(nconf.get('conf'));
let repo = null;

try {
    const config = nconf.get();
    repo = new UserRepo(config.mongo.connectionString);
    const timeService = new TimeService();
    const httpService = new HttpService();
    const emailService = new EmailService();
    const redditService = new RedditService(httpService, config);
    const userService = new UserService(repo, timeService, redditService, emailService);

    const app = express();

    app.use(morgan('dev'));
    app.use(cors());
    app.use(bodyParser.json());

    require('./controllers/userController.js')(app, config, userService);
    app.listen(nconf.get('server').port, () => console.log('ready'));

} catch (error) {
    console.error(`unexpected error encountered. Error: ${error.stack}`);
    throw (error);
} finally {
    repo.client.close();
}

