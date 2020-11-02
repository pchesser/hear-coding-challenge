'use strict';

const errors = require('../errors');

class UserService {
    constructor(repo, redditService, timeService) {
        this.repo = repo;
        this.redditService = redditService;
        this.timeService = timeService;
    }

    addUser = async (emailAddress, firstName) => {
        if (!emailAddress) {
            throw new errors.ValidationError('emailAddress cannot be null');
        }
        if (!firstName) {
            throw new errors.ValidationError('firstName cannot be null');
        }
        try {
            const exitingUser = await this.repo.getUserByEmailAddress(emailAddress, firstName);
            if (exitingUser) {
                console.error(`Attempt to add user with existing email address: ${emailAddress}`);
                // note: from a security perspective, we may not want to be this helpful with the error message
                // since the use-case for this is an internal app, we will not worry about that for now. 
                throw new errors.UserExistsError(`emailAddress: ${emailAddress} already exists`);
            }

            const user = {
                emailAddress: emailAddress,
                firstName: firstName,
                favoriteSubReddits: null,
                notificationPreferences: {
                    notificationTime: '08:00-00:00',
                    utcNotificationTime: '08:00.000Z',
                    sendNewsletter: false
                }
            };

            return await this.repo.addUser(user);
        } catch (error) {
            console.error(`Unexpected error encountered when adding new user with emailAddress:${emailAddress} and firstName: ${firstName}. Error: ${error.stack}`);
            throw error;
        }
    };

    updateSendNewsletter = async (userId, sendNewsletter) => {
        if (!userId) {
            console.error(`null userId passed`)
            throw new errors.ValidationError('userId cannot be null');
        }
        if (sendNewsletter === null || sendNewsletter === undefined) {
            console.error(`Attempt to update sendNewsletter status to null for user ${userId}`);
            throw new errors.ValidationError('status must be true or false');
        }
        if (typeof sendNewsletter !== 'boolean') {
            console.error(`Attempt to send non boolean value for updateSendNewsletter. Value: ${sendNewsletter}`);
            throw new errors.ValidationError('status must be true or false');
        }
        try {
            console.debug(`getting user ${userId}`);

            const user = await this.#getUserOrThrow(userId);

            user.notificationPreferences.sendNewsletter = sendNewsletter;

            console.debug(`updating preferences`);
            await this.repo.updateUserNotificationPreferences(user);
        } catch (error) {
            console.error(`Unexpected error encountered when updating sendNewsletter for user ${userId} and sendNewsletter: ${sendNewsletter}. Error: ${error.stack}`);
            throw error;
        }
    };

    updateNotificationTime = async (userId, time) => {
        if (!userId) {
            console.error(`null userId passed`)
            throw new errors.ValidationError('userId cannot be null');
        }
        if (!time) {
            console.error(`null time passed`)
            throw new errors.ValidationError('time cannot be null');
        }

        try {
            const user = await this.#getUserOrThrow(userId);

            console.debug(`parsing utc time`);
            const utcTime = this.timeService.convertTimeToUtc(time);

            user.notificationPreferences.notificationTime = time;
            user.notificationPreferences.utcNotificationTime = utcTime;

            console.debug(`updating preferences`);
            await this.repo.updateUserNotificationPreferences(user);
        } catch (error) {
            console.error(`Unexpected error encountered when updating notification time for user ${userId} and time: ${time}. Error: ${error.stack}`);
            throw error;
        }
    };

    addSubreddits = async (userId, subreddits) => {
        if (!userId) {
            console.error(`null userId passed`)
            throw new errors.ValidationError('userId cannot be null');
        }

        if (!subreddits) {
            console.error(`null subreddits passed`);
            throw new errors.ValidationError(`subreddits cannot be null'`);
        }

        const user = await this.#getUserOrThrow(userId);
        if (!user.favoriteSubReddits) {
            user.favoriteSubReddits = [];
        }
        const subredditSet = new Set(user.favoriteSubReddits);

        console.debug(`adding subreddits`);
        for (const subreddit of subreddits) {
            if (!subreddit) {
                console.warn(`Attempt to add null subreddit to user ${userId}`);
                // if this becomes a common problem, consider an exception instead
                continue;
            }
            const normalized = subreddit.toLowerCase();
            subredditSet.add(normalized);
            console.debug(`subreddit: ${normalized}`);
        }
        console.debug('doing array');
        user.favoriteSubReddits = Array.from(subredditSet);
        console.log(`${JSON.stringify(user)}`);

        try {
            await this.repo.updateUserSubreddits(user);
        } catch (error) {
            console.error(`Error adding subReddits for user ${userId}, and subreddits ${JSON.stringify(subreddits)}. Error stack ${error.stack}`);
            throw error;
        }
    }

    deleteSubreddits = async (userId, subreddits) => {
        if (!userId) {
            console.error(`null userId passed`)
            throw new errors.ValidationError('userId cannot be null');
        }

        if (!subreddits) {
            console.error(`null subreddits passed`);
            throw new errors.ValidationError(`subreddits cannot be null'`);
        }
        try {
            const user = await this.#getUserOrThrow(userId);
            if (!user.favoriteSubReddits) {
                user.favoriteSubReddits = [];
            }
            const subredditSet = new Set(user.favoriteSubReddits);

            console.debug(`deleting subreddits`);
            for (const subreddit of subreddits) {
                if (!subreddit) {
                    console.warn(`Attempt to remove null subreddit to user ${userId}`);
                    // if this becomes a common problem, consider an exception instead
                    continue;
                }
                const normalized = subreddit.toLowerCase();
                subredditSet.delete(normalized);
                console.debug(`subreddit: ${normalized}`);
            }
            user.favoriteSubReddits = Array.from(subredditSet);

            await this.repo.updateUserSubreddits(user, true);
            if (!user.favoriteSubReddits.length) {
                user.notificationPreferences.sendNewsletter = false;
                await this.repo.updateUserNotificationPreferences(user);
            }
        } catch (error) {
            console.error(`Error Adding SubReddit. Error stack ${error.stack}`);
            throw error;
        }

    };

    getUserById = async (userId) => {
        if (!userId) {
            console.error(`null userId passed`)
            throw new errors.ValidationError('userId cannot be null');
        }
        try {
            const user = await this.#getUserOrThrow(userId);
            return user;
        } catch (error) {
            console.error(`Error Getting User. Error stack ${error.stack}`);
            throw error;
        }
    };

    #getUserOrThrow = async (userId) => {
        const user = await this.repo.getUserById(userId);
        if (!user) {
            console.error(`User with id: ${userId} not found`);
            throw new errors.NotFoundError('Not Found');
        }

        return user;
    };
};

exports.UserService = UserService;