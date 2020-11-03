'use strict';

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

class UserRepo {
    constructor(connectionURL) {
        this.connectionURL = connectionURL;
        this.client = new MongoClient(connectionURL);
        this.connection = this.client.connect();
    }

    addUser = async (user) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('inserting');
            const inserted = await collection.insertOne(user);

            console.log(JSON.stringify(inserted));
            return inserted.insertedId;

        } catch (error) {
            throw error;
        }
    };

    updateUserSubreddits = async (user) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('updating');
            const updateQuery = { _id: ObjectId(user._id) };

            const newVals = { $set: { favoriteSubReddits: user.favoriteSubReddits } };
            const updated = await collection.updateOne(updateQuery, newVals);

            console.log(JSON.stringify(updated));
            return updated;

        } catch (error) {
            console.log(`${error.stack}`);
            throw error;
        }
    };

    updateUserNotificationPreferences = async (user) => {
        try {
            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('updating');
            const updateQuery = { _id: ObjectId(user._id) };
            const newVals = { $set: { notificationPreferences: user.notificationPreferences } }
            const updated = await collection.updateOne(updateQuery, newVals);

            console.log(JSON.stringify(updated));
            return updated;

        } catch (error) {
            console.log(`${error.stack}`);
            throw error;
        }
    };

    getUserByEmailAddress = async (emailAddress) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('querying');
            const query = { emailAddress: emailAddress };
            const found = await collection.findOne(query);

            console.log(JSON.stringify(found));
            return found;
        } catch (error) {
            throw error;
        }
    };

    getUserById = async (id) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('querying');
            const query = { _id: ObjectId(id) };
            const found = await collection.findOne(query);

            console.log(`Found: ${JSON.stringify(found)}`);
            return found;
        } catch (error) {
            throw error;
        }
    };

    getUsersExpectingNewsletters = async (notificationTimeUtc) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('users');

            console.log('querying');
            const query = { 
                "$and": [ 
                    {"notificationPreferences.utcNotificationTime" : {"$eq": notificationTimeUtc}}, 
                    {"notificationPreferences.sendNewsletter": {"$eq":true } }
                ]
            };

            const found = await collection.find(query);
            // this is not going to scale well as the collection grows. 
            // At that point, it may be better to return an iterator to go
            // through the cursor. 
            return await found.toArray();
        } catch (error) {
            console.error(`Unexpected error. error: ${error.stack}`);
            throw error;
        }
    };
}

exports.UserRepo = UserRepo;