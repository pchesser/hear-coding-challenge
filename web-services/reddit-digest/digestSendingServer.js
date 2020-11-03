'use strict';

(async () => {


const nconf = require('nconf');
const UserRepo = require('./repos/userRepo').UserRepo;
const DigestRepo = require('./repos/digestRepo').DigestRepo;
const TimeService = require('./data-services/timeService').TimeService;
const RedditService = require('./data-services/redditService').RedditService;
const HttpService = require('./data-services/httpService').HttpService;
const DigestService = require('./data-services/digestService').DigestService;
const EmailService = require('./data-services/emailService').EmailService;

nconf.argv().env('__');
nconf.defaults({ conf: `${__dirname}/config.json` });
nconf.file(nconf.get('conf'));
let userRepo = null;
let digestRepo = null;

try {
    const config = nconf.get();
    digestRepo = new DigestRepo(config.mongo.connectionString);
    userRepo = new UserRepo(config.mongo.connectionString);
    const timeService = new TimeService();
    const httpService = new HttpService();
    const emailService = new EmailService();
    const redditService = new RedditService(httpService, config);
    const digestService = new DigestService(userRepo, digestRepo, redditService, timeService, emailService, config);

    await digestService.pollForDigestsToSend();

} catch (error) {
    console.error(`unexpected error encountered. Error: ${error.stack}`);
    throw (error);
} finally {
    userRepo.client.close();
}
})().catch(error => {
    console.error(error);
    throw error;
});

