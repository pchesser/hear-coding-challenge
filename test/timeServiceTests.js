'use strict';

const errors = require('../web-services/reddit-digest/errors');
const moment = require('moment-timezone');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Sut = require('../web-services/reddit-digest/data-services/timeService').TimeService;

describe('Time Service Tests', function() {     

    it('createTomorrowNotificationUtcTimeStamp should throw if notificationPreferences is null', function() {       
        
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(null)).to.throw(errors.ValidationError, 'notificationPreferences cannot be null');
    });

    it('createTomorrowNotificationUtcTimeStamp should throw if notificationPreferences.notificationTime is null', function() {       
        const badData = {
            notificationTime: null
        };
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(badData)).to.throw(errors.ValidationError, 'notificationTime cannot be null');
    });
    it('createTomorrowNotificationUtcTimeStamp should throw if notificationPreferences.timeZone is null', function() {       
        const badData = {
            notificationTime: "08:00",
            timeZone: null
        };
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(badData)).to.throw(errors.ValidationError, 'timeZone cannot be null');
    });

    it('createTomorrowNotificationUtcTimeStamp should throw if the hour is invalid', function() {       
        const badData = {
            notificationTime: "25:00",
            timeZone: 'America/Denver'
        };
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(badData)).to.throw(errors.InvalidTimeError, `notificationTime must be in format "hh:mm"`);
    });

    it('createTomorrowNotificationUtcTimeStamp should throw if the minute is invalid', function() {       
        const badData = {
            notificationTime: "08:99",
            timeZone: 'America/Denver'
        };
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(badData)).to.throw(errors.InvalidTimeError, `notificationTime must be in format "hh:mm"`);
    });

    it('createTomorrowNotificationUtcTimeStamp should throw if the time is bad string', function() {       
        const badData = {
            notificationTime: "08:beingTricky",
            timeZone: 'America/Denver'
        };
        const sut = new Sut();

        expect(() => sut.createTomorrowNotificationUtcTimeStamp(badData)).to.throw(errors.InvalidTimeError, 'notificationTime must be in format "hh:mm');
    });

    it('createTomorrowNotificationUtcTimeStamp should convert the time to the expected format', function() {       
        const hour = 13;
        const minute = 27;
        const data = {
            notificationTime: `${hour}:${minute}`, 
            timeZone: 'America/Phoenix'
        };
        const sut = new Sut();

        const expected = moment().tz(data.timeZone);
        expected.hour(hour).minute(minute).second(0).millisecond(0);
        expected.add(1, 'days');        

        const result = sut.createTomorrowNotificationUtcTimeStamp(data);
        result.should.equal(expected.toISOString());
    });
});

