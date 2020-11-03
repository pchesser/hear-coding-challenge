'use strict';

const { HTML5_FMT } = require('moment-timezone');
const moment = require('moment-timezone');
const errors = require('../errors');

class TimeService {
    #validTimeZones = new Set(moment.tz.names());

    constructor() {
    }

    createTomorrowNotificationUtcTimeStamp = (notificationPreferences) => {
        console.debug(`creating timestamp from notificationPreferences: ${JSON.stringify(notificationPreferences)}`);

        if (!notificationPreferences) {
            console.error('null notificationPreferences passed.')
            throw new errors.ValidationError('notificationPreferences cannot be null');
        }
        if (!notificationPreferences.notificationTime) {
            console.error('null notificationTime passed.')
            throw new errors.ValidationError('notificationTime cannot be null');
        }
        if (!notificationPreferences.timeZone) {
            console.error('null timeZone passed.')
            throw new errors.ValidationError('timeZone cannot be null');
        }

        const parsedHourAndMinutes = this.#getHourAndMinuteFromPreferences(notificationPreferences);

        const localized = moment().tz(notificationPreferences.timeZone);
        localized.hour(parsedHourAndMinutes.hour).minute(parsedHourAndMinutes.minute).second(0).millisecond(0);
        localized.add(1, 'days');

        return localized.toISOString();
    }

    getCurrentToTheMinuteUtcTimeStamp = () => {
        console.debug(`creating current to the minute timestamp`);
        const utc = moment.utc();
        utc.second(0).millisecond(0);
        return utc.toISOString();
    };

    validateTimeFormat = (time) => {
        const tokens = time.split(':');
        if (tokens.length !== 2) {
            console.error(`invalid notificationTime passed. notificationPreferences: ${JSON.stringify(notificationPreferences)}`)
            throw new errors.InvalidTimeError('notificationTime must be in format "hh:mm"');
        }

        const hour = parseInt(tokens[0]);
        if (isNaN(hour) || hour < 0 || hour > 23) {
            console.error(`invalid notificationTime passed. notificationPreferences: ${JSON.stringify(notificationPreferences)}`)
            throw new errors.InvalidTimeError('notificationTime must be in format "hh:mm"');
        }

        const minute = parseInt(tokens[1]);
        if (isNaN(minute) || minute < 0 || minute > 59) {
            console.error(`invalid notificationTime passed. notificationPreferences: ${JSON.stringify(notificationPreferences)}`)
            throw new errors.InvalidTimeError('notificationTime must be in format "hh:mm"');
        }
    };

    validateTimeZone = (timeZone) => {
        return this.#validTimeZones.has(timeZone);
    };

    #getHourAndMinuteFromPreferences = (notificationPreferences) => {
        this.validateTimeFormat(notificationPreferences.notificationTime);

        const tokens = notificationPreferences.notificationTime.split(':');    
        return {
            hour: parseInt(hour),
            minute: parseInt(minute)
        };
    }
}

exports.TimeService = TimeService;