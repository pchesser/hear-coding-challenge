'use strict';

const moment = require('moment');
const errors = require('../errors');

class TimeService {
    constructor() {
    }

    convertTimeToUtc(time) {
        if (!time) {
            console.error('null time passed.')
            throw new errors.ValidationError('time cannot be null');
        }

        console.debug(`parsing time. ${time}`);
        const parsed = new moment.utc(`2020-11-01T${time}`);

        if (parsed instanceof moment && parsed.format() !== 'Invalid date') {

            return `${parsed.format('hh:mm')}:00.000Z`;
        }
        console.log(`Error parsing time: ${parsed}`);
        throw new errors.InvalidTimeError(`${time} is not a valid time string`);
    }
}

exports.TimeService = TimeService;