Reddit Digest Service.

Architecture Notes:
Due to time constraints, this is more of a proof of concept than a full fledged solution. For instance, the emails are being sent in process: when the application's user base grows large enough (or a few users decide they want digests from lots of subreddits), it may take long enough to send th emails that the one minute polling interval is surpassed, and we could miss sending newsletters. 

A more permanent architectural implementation would be to use asynchronous messaging rather than working in process. For instance, we could gather all users needing a message to be sent, and enqueue that data, where another process could pick the mess