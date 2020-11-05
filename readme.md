# Reddit Digest Service
This document is a high level overview of some of the design decisions that were made for this challenge. One of the biggest items of note is that I a chose to implement the API with express, and the data store with MongoDB. I am an amateur with both technologies, so I apologize for any glaring errors. Professionally, I have been working with AWS technologies, so I would probably have implemented the API with APIGateway, and the datastore with DynamoDB. But, if I did that, there wouldn't be anything to test or to look at aside from some terraform files, and that just sounds boring! 

## Running the code
The following tasks will run the various servers:
"startWebServer": "nodemon web-services\\reddit-digest\\webServer.js",
"startDigestCreationPolling":"nodemon web-services\\reddit-digest\\digestCreationServer.js",
"startDigestSendPolling":"nodemon web-services\\reddit-digest\\digestSendingServer.js"

## Datastore Implementation Notes
I chose MongoDB as the backing data store. A document store seemed like a good fit, especially for storage of the message templates. Normally I would have included scripts to create the collections/indexes, but created them directly through the GUI to save some time. Here is what was created.

*users collection*
This collection stores the data pertinent to the user: name, email address, notification preferences and the subreddits the user would like to receive in their digest. 

Example Document
{
    "_id": {
        "$oid":"5fa0884aa2f78f44b0a65e9f"
    },
    "emailAddress": "patrick5@fake.com",
    "firstName": "patrick",
    "favoriteSubReddits": ["halo","politics","publicfreakout"],
    "notificationPreferences": { 
        "notificationTime": "15:43",
        "timeZone": "America/Denver",
        "sendDigest": true
        }
    }
}
  
Items of note:
* timeZone needs to be a valid entry from https://www.iana.org/time-zones time zone database
* notificationTime is the the 24 hour local time (reflected by the timeZone entry) that the user would like to receive their digest.
* emailAddress must be unique across the system
* there is no limit enforced on the favoriteSubreddits collection, but at some point it may be beneficial to enforce a limit so we don't create notifications that are too big. 

Indexes:
* notificationPreferences.sendDigest
* Unique Index on emailAddress

*daily_digests collection*
Each entry in this collection represents a daily digest that will be sent to a user, along with its scheduled send time (in UTC).

This table is a good candidate to be "culled" after a specified time period (say, 30 days) so that it doesn't grow too big and become hard to maintain. Culling is fair game in this case because, after the day the digest is supposed to be sent, it loses value exponentially. We could consider moving data to a historical collection, or other data store, after 30 days if we want to keep it around for reporting. 

Example Document
{
  "_id": {
    "$oid": "5fa1c5e2d8271d2d68ee9d56"
  },
  "firstName": "patrick",
  "emailAddress": "patrick5@fake.com",
  "subredditData": [
    {
      "subredditAddress": "http://reddit.com/r/halo",
      "posts": [
        {
          "thumbnail": "https://b.thumbs.redditmedia.com/-rHlfHjQBeebE1ApkRSzSCe3F55QKGaqs4itdDi_2PY.jpg",
          "score": 14918,
          "title": "Made another quick among us/Halo scene"
        },
        {
          "thumbnail": "https://b.thumbs.redditmedia.com/7FQlA3UZRO7SeIs5soAeNSiSK2ChA61j6tuVIj_sJyk.jpg",
          "score": 6573,
          "title": "Halo 4 came out on Election day on 2012. Since then I've added my stickers to the game box."
        },
        {
          "thumbnail": "https://b.thumbs.redditmedia.com/U-S90KrguDPdyabm8lluOYSN8pPa7Xi5JoEPhXCUNMo.jpg",
          "score": 1548,
          "title": "Halo reach MK V helmet I made for a friend of mine"
        }
      ]
    },
    {
      "subredditAddress": "http://reddit.com/r/politics",
      "posts": [
        {
          "thumbnail": "https://b.thumbs.redditmedia.com/ZIFKOBTHO7BsPQh43uq35XEN94XCPkVLq0LsPBuwg1M.jpg",
          "score": 76372,
          "title": "Trump Supporters That Harassed Biden Bus Were Armed, Operation Organized in Private Facebook Group Linked to QAnon"
        },
        {
          "thumbnail": "https://a.thumbs.redditmedia.com/gOj2qINI45Yzm211ITvBZoiHCGToexhzJ6BiD5Td7a4.jpg",
          "score": 75289,
          "title": "Trump's GOP Worked Harder to Stop People From Voting Than They Did to Stop Covid-19 From Spreading"
        },
        {
          "thumbnail": "https://b.thumbs.redditmedia.com/2pBbmA_UTCtBxldQL_gQWrBWEFMjXzEZRzPLlNJixmc.jpg",
          "score": 71924,
          "title": "Letterman Says A Trump Loss Would Be 'A Relief To Every Living Being In This Country'"
        }
      ]
    }
  ],
  "sendDateTime": "2020-11-04T23:00:00.000Z"
}

Items of note:
* sendDateTime is in UTC. The time is created from the combo of timeZone and notificationTime in the user collection
* If a user has lots of subreddits, this message could get large quickly. Down the line, it could be worthwhile to compress the message, and/or to instead provide a pointer to the message that the email service could reference to retrieve the data, rather than just passing the entire blob around.

Indexes:
* sendDateTime. 

*connection management*
If I were to implement this again, I would find a way to pool one connection across each of the repos, but for an MVP deliverable, I think what I have done is ok.


## Code Implementation Notes:

*API Implementation*
This API was designed to be more "chatty" than "chunky". For instance, when a user is created, only a first name and email address are accepted, and reasonable defaults are assigned to the user upon creation, rather than accepting all values up front. To set the other user properties, the API consumer will issue a series of PUTs against the user. Like with any design decision, there are tradeoffs:
* Pros
  * Enforcement of business rules is easier, as each PUT is easily routed through its own helper service method (Aligning with the single responsibility principal)
  * Error correction for the consumer is easier, in that if a certain operation fails, it is obvious what needs to be fixed
  * While the number of calls that need to be made is greater, they are much faster, shorter calls, which does reduce the risk of timeout
* Cons
* The consumer loses the convenience of being able to supply all values at once
* If doing this in an automated fashion, and one call fails, the consumer can't just start over. Instead, the consumer will have to keep track of where in the creation process she was, and restart accordingly.

*Digest Creation Service*
This service is responsible for polling the datastore to find users who wish to receive the daily digest, and creating the digest messages to send to the email service. In the current implementation, it is designed to be run once per day, to create digests that will be sent the following day. This implementation was chosen instead of building and sending together because the time constraints of building the messages on the fly could prove troublesome, since we are trying to give the users a "to the minute" level of control on when the notification should be sent. 

*  Pros
   *  Sending the notifications becomes very easy: no need to build the message on the fly
   *  We only have to run this service once per day, so we could just spin up a container at the time we run the service, and spin it back down when done, rather than pay for the container/server to be running at all times.
   *  Each user with the same subreddit will receive the same message. If we built on the fly at run time, they could be different.

* Cons
  * If we run only once per day, it could take more than a day for a user to receive a digest, depending on when we run the job and when the user wants to receive a digest.
  * While each user will get the same content for the same subreddit, it could be very stale if something big happens after the digest is generated, and the user could miss out on something big. It could provide less stale data (and take some load off of reddit) if we ran by timezone grouping rather than for all users, but it would add a decent amount of complexity.

*Digest Sending Service*
This service is responsible for polling the datastore to find digests that are ready to be sent. It runs once a minute, and finds all digests that are ready to be sent out on this day, at this minute (UTC). It then ships those digests off the the email service. 

*  Pros
   *  Because the messages are prebuilt, the process runs very quickly and is less likely to get "off schedule"
   *  The process is easy to understand
   *  The process lends itself to async processing patterns that could keep things running quickly should we need to update how we send the messages. (see Architecture Diagram Notes) 

* Cons
  * While the process running beyond one minute is less likely, it could still happen if the number of users grows very large. It may be necessary to do some parallel processing, or to split the work among multiple processes as the number of users grows.

## Unit Tests
I wrote tests as I went in development, but, honestly, they are not as thorough as I would like them to be. Normally I would write at least one failing and one passing test per method. But, in the interest of getting this project done during a busy few days, I wrote what I felt was the minimum level of testing to feel good that I'm not delivering something buggy. 

## Architecture Diagram Notes
If we wish to provide other sorts of notifications, there are some changes we need to make. Rather than passing the digest payload directly to the "email service", I instead propose we adopt a "Pub/Sub" notification pattern. In the diagram, I have used AWS Services, but other similar solutions would work as well. The basic idea is this: We as many different types of notification (micro)services as we want. A new Lambda is created that would then subscribe to the SNS topic, and route the message to the proper service based on the payload. 

We would need to do a bit of rework on the services I created (I built them this way on purpose, so that we could have this discussion). The notification preferences would be updated to look something like this:

"notificationPreferences": [{ 
            "notificationType": "email",
            "notificationAddressee": "patrick5@fake.com",
            "notificationTime": "15:43",
            "timeZone": "America/Denver",
            "sendDigest": true
        },
        {
            notificationType": "slack",
            "notificationAddressee": "mySlackUserName",
            "notificationTime": "08:00",
            "timeZone": "America/Denver",
            "sendDigest": true
        }]

For each notification type, we would generate a message to SNS. The message would look something like this:

{
    "notificationType": "slack",
    "notificationAddressee": "mySlackUserName",
    "digestLocation": "arn:aws:s3:::hear-reddit-digest.com/digest-payloads/slackSampleNotification"
}
Or this:
{
    "notificationType": "email",
    "notificationAddressee": "patrick5@fake.com",
    "digestLocation": "arn:aws:s3:::hear-reddit-digest.com/digest-payloads/emailSampleNotification"
}

Rather than posting to the email service directly, the Notification Sending Service would publish these messages to SNS. In addition, instead of sending the payload directly in the SNS message, the Notification Sending Service would instead place the payload in an S3 bucket, and include the link to the bucket in the message. This will keep the messages under the 256k hard limit that SNS enforces.

The Routing Lambda would then examine the message payload, and route to the appropriate service based on the "notificationType" property. The service in question would then get the payload from S3, and use that to build and send the notification.

Pros:
* Our timeout worry is lessened. It generally takes less time to publish to an SNS topic and upload a doc to s3 than to build and send an email with a lot of graphics, so we should be able to process many more digest notifications on the minute
* Putting the data in S3, rather than provide direct DB access to the notification services, keeps the data stores separate, and allows us to remove data from (object ids for instance) that the sending services don't really need access to. It also allows us to update our "schema" freely, as long as we get the digests into the proper format for the services.
* The router allows us to build small services that only do one thing, rather than a big service that tries to handle all notification cases. If we need to make changes to one service, or introduce a new service, we can do so without disrupting the other services with a deployment.

Cons:
* Any time we introduce more moving parts, it becomes harder to see what the system is doing as a whole. We will need to keep our documentation up to date.
* The Lambda Router will need to be written in such a way that an unknown message format does not break it.
* There will be some added cost with the Lambda and the S3 bucket, but it will be minimal (especially if we set our data retention policies properly).
  
