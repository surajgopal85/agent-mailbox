AGENT MAILBOX — CORE DEMO

Given:
I am an authorized agent/app developer.

When:
1. I request a temporary mailbox with a 60-minute TTL.
2. Agent Mailbox returns a unique email address.
3. An email is sent to that address.
4. The inbound provider delivers the email to Agent Mailbox.
5. I request the mailbox's messages.
6. I request extraction from the message.

Then:
Agent Mailbox returns the expected verification code or safe HTTPS link.

Finally:
I delete the mailbox.
The mailbox and its messages can no longer be retrieved.

AUTHORIZED USE ONLY

Agent Mailbox exists for authorized automation,
testing, and agent workflows.

It must not be used for:
- mass account creation
- bypassing site controls
- credential theft
- defeating rate limits