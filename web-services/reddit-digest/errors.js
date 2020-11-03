'use strict';

class UserExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserExistsError';
    }
}

exports.UserExistsError = UserExistsError;

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

exports.NotFoundError = NotFoundError;

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

exports.ValidationError = ValidationError;

class InvalidTimeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidTimeError';
    }
}

exports.InvalidTimeError = InvalidTimeError;

class SubRedditRetrievalError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SubRedditRetrievalError';
    }
}

exports.SubRedditRetrievalError = SubRedditRetrievalError;

class MongoConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MongoConnectionError';
    }
}

exports.MongoConnectionError = MongoConnectionError;