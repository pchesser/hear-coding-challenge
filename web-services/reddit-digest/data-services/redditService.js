'use strict';

const errors = require('../errors');

class RedditService {
    constructor(httpService, config) {
        this.httpService = httpService;
        this.redditBaseUrl = config.reddit.baseUrl;
        this.subredditLimit = config.reddit.subredditLimit;

        console.log(this.redditBaseUrl);
        console.log(this.subredditLimit);
    }

    getSubRedditData = async (subReddit) => {
        const url = `${this.redditBaseUrl}${subReddit}/top.json?limit=${this.subredditLimit}`;
        const result = {
            subredditAddress:`${this.redditBaseUrl}${subReddit}`,
            posts: []
        };

        if (!subReddit) {
            throw new errors.ValidationError('subreddit cannot be null');
        }
        try {
            const response = await this.httpService.getRequest(url);
            if (response.status > 199 && response.status < 300) {
                const children = response.data.data.children;                
                if (!children.length){
                    throw new errors.NotFoundError('Error retrieving subreddits.');
                }

                for (const child of children) {
                    result.posts.push({
                        thumbnail: child.data.thumbnail,
                        score: child.data.score,
                        title: child.data.title
                    });
                }

                return result;
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