'use strict';

const errors = require('../errors');

class UserService {
    constructor(repo, redditService, timeService) {
        this.repo = repo;
        this.redditService = redditService;
        this.timeService = timeService;
    }

    addUser = async (emailAddress) => {
        try {
            const exitingUser = await this.repo.getUserByEmailAddress(emailAddress);
            if (exitingUser) {
                console.error(`Attempt to add user with existing email address: ${emailAddress}`);
                // note: from a security perspective, we may not want to be this helpful with the error message
                // since the use-case for this is an internal app, we will not worry about that for now. 
                throw new errors.UserExistsError(`emailAddress: ${emailAddress} already exists`);
            }
    
            const user = {
                emailAddress: emailAddress,
                favoriteSubReddits: null,
                notificationPreferences: {
                    notificationTime: '08:00-00:00',
                    utcNotificationTime: '08:00.000Z',
                    sendNewsletter: false
                }
            };
    
            console.log('calling repo');
            return await this.repo.addUser(user); 
        } catch (error) {
            
        }
    };

    updateSendNewsletter = async (userId, sendNewsletter) => {
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
            throw error;
        }
    };

    updateNotificationTime = async (userId, time) => {
        console.debug(`getting user ${userId}`);
        const user = await this.#getUserOrThrow(userId);

        try {
            console.debug(`parsing utc time`);
            const utcTime = this.timeService.convertTimeToUtc(time);

            user.notificationPreferences.notificationTime = time;
            user.notificationPreferences.utcNotificationTime = utcTime;

            console.debug(`updating preferences`);
            await this.repo.updateUserNotificationPreferences(user);
        } catch (error) {
            throw error;
        }
    };

    addSubreddits = async (userId, subreddits) => {
        if (!userId || !subreddits) {
            console.error(`Invalid parameter passed. userId ${userId}. subreddit ${subreddit}`);
            throw new errors.ValidationError(`One or more parameters are null`);
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
            console.error(`Error Adding SubReddit. Error stack ${error.stack}`);
            throw error;
        }
    }

    deleteSubreddits = async (userId, subreddits) => {
        if (!userId || !subreddits) {
            console.error(`Invalid parameter passed. userId ${userId}. subreddits ${subreddit}`);
            throw new errors.ValidationError(`One or more parameters are null`);
        }

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

        try {
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
        return await this.#getUserOrThrow(userId);
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