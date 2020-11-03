'use strict';

// this should get broken down into 
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

class DigestRepo {
    constructor(connectionURL) {
        this.connectionURL = connectionURL;
        this.client = new MongoClient(connectionURL);
        this.connection = this.client.connect();
    }

    getDigestsToSend = (sendDateTime) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting connection');
            const collection = db.collection('daily_digests');

            console.log('querying');
            const query = { "sendDateTime": { "$eq": sendDateTime } };

            const cursor = collection.find(query);                        
            return cursor;
        } catch (error) {
            console.error(`Unexpected error. error: ${error.stack}`);
            throw error;
        }
    };

    saveUserDailyDigest = async (digest) => {
        try {

            console.log('getting db');
            const db = this.client.db('reddit_digest');
            console.log('getting collection');
            const collection = db.collection('daily_digests');

            console.log('inserting');
            const inserted = await collection.insertOne(digest);

            return inserted.insertedId;
        } catch (error) {
            console.error(`Unexpected error inserting user daily digest. error: ${error.stack}`);
            throw error;
        }
    }
}

exports.DigestRepo = DigestRepo;