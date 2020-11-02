'use strict';

class RedditService {
    constructor(httpService, redditBaseUrl) {
        this.httpService = httpService;
        this.redditBaseUrl = redditBaseUrl;
    }

    // isValidSubReddit = async (subReddit) => {
    //     const url = `${redditBaseUrl}/subreddits/search.json?q=${subReddit}&count=1`;

    //     try {
    //         const response = await this.httpService.getRequest(url);
            
    //         if (response.status > 199 && response.status < 300) {
    //             const children = response.data.children;
    //             if (!children.length) {
    //                 return false;
    //             }

    //             if (children[0].display_name.toLowerCase() !== subReddit.toLowerCase()) {
    //                 return false;
    //             }
    //         };
    //     } catch (error) {
    //         console.log(`Error Communicating `)
    //         return false;
    //     }
    // };

};

exports.RedditService = RedditService;