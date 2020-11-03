'use strict';

class PollingService {
    constructor(userService, config) {
        this.userService = userService;
        this.config = config;        
    }

    pollForNotifications = async() =>{
        setInterval(this.#pollAndBeginNotificationProcess, this.config.reddit.pollingInterval);
    }

    #pollAndBeginNotificationProcess = async() => {
        const startPosition = 11;
        const endPosition = 16;
        const nowUtc = new Date().toISOString();
        const hourAndMinute = nowUtc.substring(startPosition, endPosition);
        const notificationTimeUtc = `${hourAndMinute}:00.000Z`;

        console.debug(notificationTimeUtc);
        // Note: this is a naive, synchronous implementation because of time constraints.
        // As the data set grows, this is less likely to complete within a minute and we
        // will start to miss notifications. A better implementation would involve queueing
        // and searching for/sending messages asynchronously.
        await this.userService.sendNewsletters(notificationTimeUtc);
    }    
}

exports.PollingService = PollingService;