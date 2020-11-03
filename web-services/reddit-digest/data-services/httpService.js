'use strict';
const axios = require('axios');
const errors = require('../errors');

class HttpService {
    constructor() {
    }

    getRequest = async (url) => {
        console.debug(`Attempting Get Request for URL: ${url}`);

        try {
            const resp = await axios.get(url);
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

    postRequest = async (url, payload) =>{
        console.debug(`Attempting POST Request for URL: ${url} with payload: ${payload}`);
        if (!url) {
            console.error(`Null url passed`);
            throw new errors.Val
        }
        try {
            const resp = await axios.post(url, payload);
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