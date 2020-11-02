'use strict';

const errors = require('../web-services/reddit-digest/errors');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const Sut = require('../web-services/reddit-digest/data-services/redditService').RedditService;

describe('Reddit Service Tests', function() {
    
    it('should throw if the emailAddress is in use', async function() {
        const mockRepo = {
            getUser: async (emailAddress) => {
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

        await expect(sut.addUser('bubba@fake.com')).to.eventually.be.rejectedWith(errors.UserExistsError, 'emailAddress: bubba@fake.com already exists');
    });

    it('should create a new user if the username is not in use', async function() {
        const mockRepo = { };
        
        mockRepo.addUser = sinon.fake.resolves(true);
        mockRepo.getUser = sinon.fake.resolves(null);
        const sut = new Sut(mockRepo);

        await sut.addUser('bubba@fake.com');
        
        mockRepo.getUser.called.should.be.true;
        mockRepo.addUser.called.should.be.true;
    });
});

