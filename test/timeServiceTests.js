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
   

    it('convertTimeToExpectedFormat should throw if the time is null', function() {       
        
        const sut = new Sut();

        expect(() => sut.convertTimeToExpectedFormat(null)).to.throw(errors.ValidationError, 'time cannot be null');
    });

    it('convertTimeToExpectedFormat should throw if the hours are invalid', function() {       
        const invalidTime = '25:99';
        const sut = new Sut();

        expect(() => sut.convertTimeToExpectedFormat(invalidTime)).to.throw(errors.InvalidTimeError, `hours must be between 00 - 23`);
    });

    it('convertTimeToExpectedFormat should throw if the minutes are invalid', function() {       
        const invalidTime = '15:99';
        const sut = new Sut();

        expect(() => sut.convertTimeToExpectedFormat(invalidTime)).to.throw(errors.InvalidTimeError, `minutes must be between 00 - 59`);
    });

    it('convertTimeToExpectedFormat should throw if the time is bad string', function() {       
        const invalidTime = 'invalidChars';
        const sut = new Sut();

        expect(() => sut.convertTimeToExpectedFormat(invalidTime)).to.throw(errors.InvalidTimeError, 'time must be in hh:mm format, in UTC timezone');
    });

    it('convertTimeToExpectedFormat should convert the time to the expected format', function() {       
        const utcTime = '08:00';
        const sut = new Sut();

        const result = sut.convertTimeToExpectedFormat(utcTime);
        result.should.equal('08:00:00.000Z');
    });
});

