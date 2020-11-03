'use strict';

const moment = require('moment');
const errors = require('../errors');

class TimeService {
    #regex = /^\d{2}:\d{2}$/;

    constructor() {
    }

    convertTimeToExpectedFormat(time) {
        if (!time) {
            console.error('null time passed.')
            throw new errors.ValidationError('time cannot be null');
        }
        // sanity check
        if (!this.#regex.test(time)) {
            console.error(`invalid time passed. time: ${time}`)
            throw new errors.InvalidTimeError('time must be in hh:mm format, in UTC timezone');
        }

        console.debug(`parsing time. ${time}`);
        const tokens = time.split(':');
        const hour = parseInt(tokens[0]);
        const minutes = parseInt(tokens[1]);

        if (hour > 23) {
            console.error(`invalid time passed. time: ${time}`);
            throw new errors.InvalidTimeError('hours must be between 00 - 23');
        }
        if (minutes > 59) {
            console.error(`invalid time passed. time: ${time}`);
            throw new errors.InvalidTimeError('minutes must be between 00 - 59');
        }

        return `${time}:00.000Z`;
    }
}

exports.TimeService = TimeService;