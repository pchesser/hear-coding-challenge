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

describe('Reddit Service Tests', function () {

    it('should throw if subreddit is null', async function () {
        const config = {
            reddit: {
                baseUrl: "http://reddit.com/r/",
                subredditLimit: 3
            }
        };
        const mockHttpsService = {};
        const sut = new Sut(mockHttpsService, config);

        await expect(sut.getSubRedditData(null)).to.eventually.be.rejectedWith(errors.ValidationError, 'subreddit cannot be null');
    });

    it('should throw if reddit api returns non 2xx response', async function () {
        const config = {
            reddit: {
                baseUrl: "http://reddit.com/r/",
                subredditLimit: 3
            }
        };
        const mockHttpsService = {
            getRequest: async () => {
                return {
                    status: 199
                };
            }
        };
        const sut = new Sut(mockHttpsService, config);

        await expect(sut.getSubRedditData('bubba')).to.eventually.be.rejectedWith(errors.SubRedditRetrievalError);
    });

    it('should throw if no posts are found', async function () {
        const config = {
            reddit: {
                baseUrl: "http://reddit.com/r/",
                subredditLimit: 3
            }
        };
        const mockHttpsService = {
            getRequest: async () => {
                return {
                    status: 200,
                    data: {
                        data: {
                            children: []
                        }
                    }
                };
            }
        };

        const sut = new Sut(mockHttpsService, config);

        await expect(sut.getSubRedditData('bubba')).to.eventually.be.rejectedWith(errors.NotFoundError, 'Error retrieving subreddits.');
    });

    it('should return top N posts for subreddit', async function () {
        const config = {
            reddit: {
                baseUrl: "http://reddit.com/r/",
                subredditLimit: 3
            }
        };
        const mockHttpsService = {
            getRequest: async () => {
                return {
                    status: 200,
                    data: {
                        data: {
                            children: [
                                {
                                    data: {
                                        thumbnail: "business.jpg",
                                        score: 999,
                                        title: "HA HA Business!"
                                    }
                                },
                                {
                                    data: {
                                        thumbnail: "mrBusinessMan.jpg",
                                        score: 879,
                                        title: "Mr Business Man!"
                                    }
                                },
                                {
                                    data: {
                                        thumbnail: "AnotherBusinessGuy.jpg",
                                        score: 665,
                                        title: "Important business!"
                                    }
                                }
                            ]
                        }
                    }
                };
            }
        };

        const sut = new Sut(mockHttpsService, config);

        const result = await sut.getSubRedditData('business');
        result.subredditAddress.should.equal(`${config.reddit.baseUrl}business`);
        result.posts.length.should.equal(3);

        const businessGuy = result.posts.filter(p => p.score === 665)[0];
        businessGuy.thumbnail.should.equal('AnotherBusinessGuy.jpg');
        businessGuy.title.should.equal("Important business!");

        const mrBusinessMan = result.posts.filter(p => p.score === 879)[0];
        mrBusinessMan.thumbnail.should.equal('mrBusinessMan.jpg');
        mrBusinessMan.title.should.equal("Mr Business Man!");

        const haHaGuy = result.posts.filter(p => p.score === 999)[0];
        haHaGuy.thumbnail.should.equal('business.jpg');
        haHaGuy.title.should.equal("HA HA Business!");
    });
});

