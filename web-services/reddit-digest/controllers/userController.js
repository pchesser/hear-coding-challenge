'use strict';
module.exports = (app, config, userService) => {

    app.get('/api/user/:id', (req, res) => {
        try {
            const user = userService.getUserById;
            if (!user) {
                res.status(404).json("User Not Found");
            }
            else {
                // no need to send this to the caller, as it's an internal property
                delete user.notificationPreferences.utcNotificationTime;
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
            const createdId = await userService.addUser(payload.emailaddress, payload.firstName);

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
            await userService.updateNotificationTime(req.params.id, payload.notificationTime, payload.timeZone);
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

    app.put('/api/user/:id/senddigest', async (req, res) => {
        const payload = req.body;
        console.log(`${JSON.stringify(payload)}`);
        try {
            await userService.updateSendDigest(req.params.id, payload.sendDigest);
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

    app.post('/api/notifications', async (req, res) =>{

    });
};