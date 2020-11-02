'use strict';

const errors = require('../web-services/reddit-digest/errors');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Sut = require('../web-services/reddit-digest/data-services/timeService').TimeService;

describe('Time Service Tests', function() {    

    const buildAllEightAmUtcs = () => {
        return [
            '20:00-12:00',
            '21:00-11:00',
            '22:00-10:00',
            '23:00-09:00',
            '00:00-08:00',
            '01:00-07:00',
            '02:00-06:00',
            '03:00-05:00',
            '04:00-04:00',
            '05:00-03:00',
            '06:00-02:00',
            '07:00-01:00',
            '09:00+01:00',
            '10:00+02:00',
            '11:00+03:00',
            '12:00+04:00',
            '13:00+05:00',
            '14:00+06:00',
            '15:00+07:00',
            '16:00+08:00',
            '17:00+09:00',
            '18:00+10:00',
            '19:00+11:00',
            '20:00+12:00',
            '21:00+13:00',
            '22:00+14:00'
        ];
    };

    it('convertTimeToUTC should throw if the time is null', function() {       
        
        const sut = new Sut();

        expect(() => sut.convertTimeToUtc(null)).to.throw(errors.ValidationError, 'time cannot be null');
    });

    it('convertTimeToUTC should throw if the time is invalid time', function() {       
        const invalidTime = '25:99';
        const sut = new Sut();

        expect(() => sut.convertTimeToUtc(invalidTime)).to.throw(errors.InvalidTimeError, `${invalidTime} is not a valid time string`);
    });

    it('convertTimeToUTC should throw if the time is bad string', function() {       
        const invalidTime = 'invalidChars';
        const sut = new Sut();

        expect(() => sut.convertTimeToUtc(invalidTime)).to.throw(errors.InvalidTimeError, `${invalidTime} is not a valid time string`);
    });

    it('convertTimeToUTC should return the same time if offset is utc', function() {       
        const utcTime = '08:00-00:00';
        const sut = new Sut();

        const result = sut.convertTimeToUtc(utcTime);
        result.should.equal('08:00:00.000Z');
    });

    it('convertTimeToUTC should return the expected utc offset', function() {       
        const utcTime = '10:35+05:00';
        const sut = new Sut();

        const result = sut.convertTimeToUtc(utcTime);
        result.should.equal('05:35:00.000Z');
    });

    it('convertTimeToUTC should return the time in the expected utc format when time is offset from utc', function() {       
        const expected = '08:00:00.000Z';

        const sut = new Sut();

        for (const timeWithOffset of buildAllEightAmUtcs()) {
            const result = sut.convertTimeToUtc(timeWithOffset);
            result.should.equal(expected);
        }
    });
});

