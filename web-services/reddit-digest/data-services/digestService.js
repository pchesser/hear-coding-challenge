'use strict';

class DigestService {
    constructor(userRepo, digestRepo, redditService, timeService, emailService, config) {
        this.userRepo = userRepo;
        this.digestRepo = digestRepo;
        this.redditService = redditService;
        this.config = config;
        this.timeService = timeService;
        this.emailService = emailService;
    }

    pollForDigestsToSend = async () => {
        setInterval(this.#sendDigestsForCurrentTime, this.config.reddit.digestSendPollingInterval);
    }

    pollForDigestCreation = async () => {
        setInterval(this.#createDigestsForTomorrowDistribution, this.config.reddit.digestCreationPollingInterval);
    }

    #sendDigestsForCurrentTime = async () => {

        const notificationTimeUtc = this.timeService.getCurrentToTheMinuteUtcTimeStamp();

        console.debug(`Polling for digests to send at ${notificationTimeUtc}`);

        // Note: this is a bit of a naive implementation because of time constraints.
        // As the data set grows, this is less likely to complete within a minute and we
        // will start to miss sending out digests. A better implementation would involve
        // sending a batch of ids to an SNS topic or message queue, and letting an async
        // worker process handle them one by one, while this waits for the next polling interval.

        try {
            console.debug(`Querying for digests to send`)
            const digestsToSendCursor = this.digestRepo.getDigestsToSend(notificationTimeUtc);
            if (!digestsToSendCursor) {
                console.info(`No users found to notify at: ${notificationTimeUtc}`);
                return;
            }

            console.debug('enumerating cursor');
            for await (const digest of digestsToSendCursor) {
                await this.emailService.send(digest);
            }
        } catch (error) {
            console.error(`Unexpected error sending newsletters: ${error.stack}`);
            throw error;
        }
    }
 
    #createDigestsForTomorrowDistribution = async () => {
        const cachedSubredditData = new Map();
        let user = null;
        let usersWithActiveNotificationStatusCursor = null;

        try {
            console.debug(`getting users expecting digests`);
            usersWithActiveNotificationStatusCursor = this.userRepo.getUsersExpectingDigests();

            if (!usersWithActiveNotificationStatusCursor) {
                console.info(`No users with active notification status found.`);
                return;
            }
        } catch (error) {
            console.error(`Error getting usersWithActiveNotifications. error ${error.stack}`);
            throw error;
        }

        try {
            console.debug('enumerating cursor');
            for await (const u of usersWithActiveNotificationStatusCursor) {
                user = u;
                const digest = {
                    firstName: user.firstName,
                    emailAddress: user.emailAddress,
                    subredditData: []
                };

                digest.sendDateTime = await this.timeService.createTomorrowNotificationUtcTimeStamp(user.notificationPreferences);

                for (const subreddit of user.favoriteSubReddits) {
                    const cached = cachedSubredditData.get(subreddit);

                    if (!cached) {
                        try {
                            const resultFromReddit = await this.redditService.getSubRedditData(subreddit);
                            if (!resultFromReddit) {
                                console.error(`Unexpected error from getSubRedditData for subreddit ${subreddit}.`);
                                continue;
                                // going to assume the user at least wants the subreddit data we could find. Moving on to next
                            }

                            cachedSubredditData.set(subreddit, resultFromReddit);
                            digest.subredditData.push(resultFromReddit);
                        } catch (error) {
                            console.error(`Unexpected error from getSubRedditData for subreddit ${subreddit}.`);
                            continue;
                            // going to assume the user at least wants the subreddit data we could find. Moving on to next
                        }
                    }
                    else {
                        digest.subredditData.push(cached);
                    }
                }

                await this.digestRepo.saveUserDailyDigest(digest);
            }
        } catch (error) {
            console.error(`Unexpected error creating reddit digests. Last processed user: ${user._id}. error: ${error}`);
            throw error;
        } finally {
            if (usersWithActiveNotificationStatusCursor) {
                usersWithActiveNotificationStatusCursor.close();
            }
        }
    }
}

exports.DigestService = DigestService;