# Baby Care Tracker Bot (Node.js + Express + MongoDB)

A simple bot for tracking baby care activities via Telegram (and optionally WhatsApp) — logging feedings, diaper changes, and medications, with statistics and scheduled reminders.

## Features

* **Record Feeding** (`/eat <amount> [HH:mm]`): log an amount (mL) and optional time (defaults to now).
* **Next Feeding** (`/nextEat`): shows elapsed time since last feeding and recommended time until next (3h).
* **Today's Feedings** (`/totalEatToday`): lists all feedings today (HH\:mm = amount) and total volume.
* **Record Diaper** (`/diaper <pee|poop> [HH:mm]`): log diaper change with optional time.
* **Record Medication** (`/med <name> [dosage] [HH:mm]`): log medication with optional dosage and time.
* **Today's Diapers** (`/totalDiaperToday`): lists and counts diaper changes today with times.
* **Today's Medications** (`/totalMedToday`): lists and counts medications today with times and dosages.
* **Input Validation**: central pre-check for required parameters, with usage hints.
* **Automatic Reminder**: every minute, if ≥2.5h passed since last feeding, sends reminder.
* **Docker Compose** setup with Node.js and MongoDB.

## Prerequisites

* [Node.js](https://nodejs.org/) v18+ and npm
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (optional)
* Telegram account for creating a bot
* (Optional) Twilio account for WhatsApp integration

## Environment Variables

Copy `.env.example` to `.env` and set values:

```ini
# MongoDB connection string
MONGO_URL=mongodb://mongo:27017/babytracker

# Telegram Bot
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

# Server port
PORT=3000
```

For WhatsApp (optional):

```ini
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Quick Start: Docker

Build and run with Docker Compose:

```bash
docker-compose up -d
```

The app listens on **port 3000**.

## Quick Start: Local

Install dependencies and start locally:

```bash
npm install
npm start
```

Adjust `.env` accordingly.

## Quick Start: Telegram Setup

1. **Create the Bot**

   * Open Telegram, search for **@BotFather**.
   * Send `/newbot`, follow prompts: choose a name and a username (must end in “bot”).
   * Copy the HTTP API token and set `TELEGRAM_BOT_TOKEN` in `.env`.

2. **Create a Group**

   * In Telegram, tap “New Group”.
   * Add your parents and caregivers.
   * Add your bot by searching its username, e.g. `@YourBotUsername`.

3. **Configure Bot Privacy**

   * In BotFather send `/mybots`, select your bot → Bot Settings → Group Privacy → Disable.
   * This allows the bot to see all group messages, not just commands prefixed with `/`.

4. **Use Commands in the Group**

   * Send `/eat 200` or other commands directly in the group chat.
   * All participants can log events seamlessly.

## Quick Start: WhatsApp Integration (Optional)

1. Sign up at [Twilio](https://twilio.com) and activate the WhatsApp Sandbox.
2. Add credentials to `.env`:

   ```
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1XXX
   ```
3. Expose your server (`ngrok http 3000`) and set the webhook URL (`https://<your-domain>/whatsapp`) in Twilio sandbox.
4. Users join by messaging `join <CODE>` to the sandbox number.

## Usage (Telegram)

Open your Telegram group and use:

| Command                        | Description                                   |                    |
| ------------------------------ | --------------------------------------------- | ------------------ |
| `/eat <amount> [HH:mm]`        | Log feeding (mL) at time or now.              |                    |
| `/nextEat`                     | Time since last feeding and recommendation.   |                    |
| `/totalEatToday`               | List all feedings today and total volume.     |                    |
| \`/diaper \<pee                | poop> \[HH\:mm]\`                             | Log diaper change. |
| `/med <name> [dosage] [HH:mm]` | Log medication with optional dosage and time. |                    |
| `/totalDiaperToday`            | List & count diaper changes today.            |                    |
| `/totalMedToday`               | List & count medications today.               |                    |
| `/help`                        | Show usage instructions.                      |                    |

## Implementation Details

* **Express** for HTTP/Webhook endpoints.
* **node-telegram-bot-api** for Telegram polling.
* **mongoose** for MongoDB ODM.
* **moment-timezone** for date parsing/formatting (Asia/Jerusalem).
* **node-cron** for scheduled reminders.

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feat/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feat/name`)
5. Open a PR

---

Feel free to open issues or suggest improvements!
