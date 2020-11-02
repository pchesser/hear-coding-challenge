'use strict';
const axios = require('axios');

class HttpService {
    constructor() {
    }

    getRequest = async (url) => {
        console.debug(`Attempting Get Request for URL: ${url}`);

        try {
            const resp = axios.get(url);
            return {
                data: resp.data,
                status: resp.status,
                statusText: resp.statusText,
                headers: resp.headers
            };
            
        } catch (error) {
            console.error(`Error encountered on get request for URL: ${url}`);
            throw error;
        }
    }
}

exports.HttpService = HttpService;