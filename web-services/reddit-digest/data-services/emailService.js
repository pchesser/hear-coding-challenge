'use strict';

class EmailService {
    constructor() {

    }

    send = async (message) => {
        console.log(JSON.stringify(message));
    };
}

exports.EmailService = EmailService;