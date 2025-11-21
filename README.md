# Discord Chat Bot Server

This is a Discord bot server that integrates with Griptape AI to process and respond to messages in Discord channels.

## Setup

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" in the sidebar and click "Add Bot"
4. Under "Token", click "Reset Token" if needed, then click "Copy" to get your bot token
   - **Important:** Treat your bot token like a password. Never share it or commit it to public repositories.
5. Save this token for your `.env` file as `DISCORD_BOT_TOKEN`

### 2. Invite the Bot to Your Server

1. In the Developer Portal, go to "OAuth2" > "URL Generator"
2. Under "Scopes", select `bot`
3. Under "Bot Permissions", select at least:
   - `Send Messages`
   - `Read Message History`
   - `View Channels`
4. Copy the generated URL and open it in your browser to invite the bot to your server

### 3. Set Environment Variables

Create a `.env` file in your project root with the following:

```env
DISCORD_BOT_TOKEN=your-discord-bot-token
HM_ACCESS_KEY=your-griptape-cloud-api-key
GENAI_STRUCTURE_ID=your-griptape-structure-id
GENAI_BASE_URL=https://your-griptape-base-url
```

### 4. Install Dependencies

```sh
npm install
discord.js node-fetch dotenv
```

### 5. Run the Bot

```sh
npm start
```

The bot will log in and respond to messages in any channel it has access to.

## How It Works

1. A user sends a message in a Discord channel where the bot is present
2. The bot receives the message, processes it through Griptape AI
3. The bot replies in the same channel

## Notes

- The bot ignores its own messages and other bots to prevent loops
- All configuration is done via the `.env` file
- For production, keep your bot token and API keys secure

---

For more information on Discord bots, see the [Discord.js Guide](https://discordjs.guide/).



stderr: usage: structure.py [-h] [-k KNOWLEDGE_BASE_ID] [-p PROMPT] [-r RULESET_ALIAS]
                    [-s] [-t THREAD_ID]

                    