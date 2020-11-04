'use strict';

const errors = require('../web-services/reddit-digest/errors');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Sut = require('../web-services/reddit-digest/data-services/userService').UserService;

describe('User Service Tests', function() {
    
    it('addUser should throw if the emailAddress is in use', async function() {
        const mockRepo = {
            getUserByEmailAddress: async (emailAddress) => {
                return {
                    id: 123,
                    emailAddress: emailAddress,
                    preferences :{
                        notificationTime: '08:00:00Z',
                        favoriteSubReddits: [],
                        sendNewsletter: false
                    }
                }
            },
            addUser: async (user) => {

            }
        };
        
        const sut = new Sut(mockRepo);

        await expect(sut.addUser('bubba@fake.com', 'bubba')).to.eventually.be.rejectedWith(errors.UserExistsError, 'emailAddress: bubba@fake.com already exists');
    });


    it('addUser should throw if the emailAddress is null', async function() {
              
        const sut = new Sut(null);
        await expect(sut.addUser(null)).to.eventually.be.rejectedWith(errors.ValidationError, 'emailAddress cannot be null');
    });

    it('addUser should throw if the firstName is null', async function() {
              
        const sut = new Sut(null);
        await expect(sut.addUser("email@fake.com", null)).to.eventually.be.rejectedWith(errors.ValidationError, 'firstName cannot be null');
    });

    it('addUser should create a new user if the username is not in use', async function() {
        const mockRepo = { };
        
        mockRepo.addUser = sinon.fake.resolves(true);
        mockRepo.getUserByEmailAddress = sinon.fake.resolves(null);
        const sut = new Sut(mockRepo);

        await sut.addUser('bubba@fake.com', 'bubba');

        mockRepo.getUserByEmailAddress.called.should.be.true;
        mockRepo.addUser.called.should.be.true;
    });
    
    it('addUser should create a new user if the username is not in use', async function() {
        const mockRepo = { };
        
        mockRepo.addUser = sinon.fake.resolves(true);
        mockRepo.getUserByEmailAddress = sinon.fake.resolves(null);
        const sut = new Sut(mockRepo);

        await sut.addUser('bubba@fake.com', 'bubba');

        mockRepo.getUserByEmailAddress.called.should.be.true;
        mockRepo.addUser.called.should.be.true;
    });
});

