'use strict';

const errors = require('../errors');

class RedditService {
    constructor(httpService, redditBaseUrl, subredditLimit) {
        this.httpService = httpService;
        this.redditBaseUrl = redditBaseUrl;
        this.subredditLimit = subredditLimit;
    }

    getSubRedditData = async (subReddit) => {
        const url = `${redditBaseUrl}/r/${subReddit}.json?limit=${this.subredditLimit}`;
        const response = {
            subredditAddress:`${redditBaseUrl}/r/${subReddit}`,
            posts: []
        };

        if (!subReddit) {
            throw new errors.ValidationError('subreddit cannot be null');
        }
        try {
            const response = await this.httpService.getRequest(url);
            
            if (response.status > 199 && response.status < 300) {
                const children = response.data.children;                

                if (!children.length){
                    throw new errors.NotFoundError('Error retrieving subreddits.');
                }

                for (const child of children) {
                    response.posts.push({
                        thumbnail: child.thumbnail,
                        score: child.score,
                        title: child.title
                    });
                }

                return response;
            } else {
                console.error(`Error response received from reddit. Response ${response}`)
                throw new errors.SubRedditRetrievalError(`Error response received from reddit. Response ${response}`);
            }
        } catch (error) {
            console.error(`Error encountered getting subreddit data for subreddit: ${subReddit}`);
            throw error;
        }
    };

};

exports.RedditService = RedditService;