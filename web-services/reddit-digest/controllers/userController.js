'use strict';

const errors = require('../errors');

module.exports = (app, config, userService) => {

    app.get('/api/user/:id', (req, res) => {
        try {
            const user = userService.getUserById
            if (!user) {
                res.status(404).json("User Not Found");
            }
            else {
                res.status(200).json(user);
            }
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            }
            else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });

    app.post('/api/user', async (req, res) => {
        const payload = req.body;
        console.log(payload);
        try {
            const createdId = await userService.addUser(payload.emailaddress);

            const responseMessage = {
                location: `http://${config.server.host}:${config.server.port}/api/user/${createdId}`
            };
            res.status(201).json(responseMessage);
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            }
            else if (typeof error === 'UserExistsError') {
                res.status(404).json(`User Not Found.`);
            }
            else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });

    app.put('/api/user/:id/notificationtime', async (req, res) => {
        const payload = req.body;
        console.log(payload);
        try {
            res.status(200).json('updated');
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            } else if (typeof error === 'NotFoundError') {
                res.status(404).json(`User Not Found.`);
            }
            else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });

    app.put('/api/user/:id/subreddits', async (req, res) => {
        const payload = req.body;
        console.log(payload);
        try {
            await userService.addSubreddits(req.params.id, payload.subreddits);
            res.status(200).json('updated');
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            } else if (typeof error === 'NotFoundError') {
                res.status(404).json(`User Not Found.`);
            } else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });

    app.delete('/api/user/:id/subreddits', async (req, res) => {
        const payload = req.body;
        console.log(payload);
        try {
            await userService.deleteSubreddits(req.params.id, payload.subreddits);
            res.status(204).json('no content');
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            } else if (typeof error === 'NotFoundError') {
                res.status(404).json(`User Not Found.`);
            }
            else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });
    
    app.put('/api/user/:id/sendnewsletter', async (req, res) => {
        const payload = req.body;
        console.log(`${JSON.stringify(payload)}`);
        try {
            await userService.updateSendNewsletter(req.params.id, payload.sendNewsletter);
            res.status(200).json('updated');
        } catch (error) {
            if (typeof error === 'ValidationError') {
                res.status(422).json(`Invalid Input. ${error.message}`);
            } else if (typeof error === 'NotFoundError') {
                res.status(404).json(`User Not Found.`);
            }
            else {
                res.status(500).json(`Unexpected exception.`);
            }
        }
    });
};