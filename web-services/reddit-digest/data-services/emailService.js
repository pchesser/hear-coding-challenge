'use strict';

class EmailService {
    constructor() {

    }

    send = async (message) => {
        //we could probably remove the database id and the sendDateTime, but they could be handy as well for debugging the other service. 
        console.debug(`Mocking call to email service by sending json to std out`);
        console.log(JSON.stringify(message, null, 2));
    };
}

exports.EmailService = EmailService;