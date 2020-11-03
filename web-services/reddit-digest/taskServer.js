'use strict';

const { EmailService } = require('./data-services/emailService');

(async () => {


const nconf = require('nconf');
const UserService = require('./data-services/userService').UserService;
const UserRepo = require('./repos/userRepo').UserRepo;
const TimeService = require('./data-services/timeService').TimeService;
const RedditService = require('./data-services/redditService').RedditService;
const HttpService = require('./data-services/httpService').HttpService;
const PollingService = require('./data-services/pollingService').PollingService;
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
    const pollingService = new PollingService(userService, config);

    await pollingService.pollForNotifications();

} catch (error) {
    console.error(`unexpected error encountered. Error: ${error.stack}`);
    throw (error);
} finally {
    repo.client.close();
}
})();

