import 'dotenv/config';
import fetch from "node-fetch";
import Discord from "discord.js";
const Client = Discord.Client;
const GatewayIntentBits = Discord.Intents?.FLAGS || Discord.GatewayIntentBits;
const Partials = Discord.Partials || {};

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const LANGFLOW_BASE_URL = process.env.LANGFLOW_BASE_URL;
const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

if (!DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is not set in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits?.Guilds || 1 << 0,
    GatewayIntentBits?.GuildMessages || 1 << 9,
    GatewayIntentBits?.MessageContent || 1 << 15,
    GatewayIntentBits?.DirectMessages || 1 << 12
  ],
  partials: [Partials.Channel || 'CHANNEL'],
});

// Langflow API call
async function runLangflow(prompt, flowId, apiKey) {
  try {
    const url = `${LANGFLOW_BASE_URL}/api/v1/run/${flowId}?wait=true`;
    const payload = {
      input_type: 'chat',
      input_value: prompt,
      output_type: 'chat',
      tweaks: {}
    };
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Langflow API error: ${response.statusText}`);
    }
    const data = await response.json();
    // Adjust this if the response structure is different
    return data.output || data.result || JSON.stringify(data);
  } catch (error) {
    console.error('Error calling Langflow API:', error);
    throw error;
  }
}

// Beautify and extract only the relevant text from Langflow API response
function beautifyLangflowOutput(response) {
  // Always extract the 'text' property from the JSON output, deeply if needed
  let text = '';
  const findText = obj => {
    if (!obj || typeof obj !== 'object') return '';
    if ('text' in obj && typeof obj.text === 'string') return obj.text;
    for (const v of Object.values(obj)) {
      const found = findText(v);
      if (found) return found;
    }
    return '';
  };
  if (typeof response === 'string') {
    // Try to parse as JSON, else just use as is
    try {
      const parsed = JSON.parse(response);
      text = findText(parsed) || response;
    } catch {
      text = response;
    }
  } else {
    text = findText(response);
  }
  // Replace multiple consecutive '\n' with a single line break, preserve single line breaks
  text = text.replace(/\n{2,}/g, '\n');
  text = text.replace(/[ \t]+/g, ' ').trim();
  return text;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  try {
    const prompt = message.content;
    const response = await runLangflow(prompt, LANGFLOW_FLOW_ID, LANGFLOW_API_KEY);
    const beautified = beautifyLangflowOutput(response);
    // Discord message content must be 2000 chars or fewer
    for (let i = 0; i < beautified.length; i += 2000) {
      await message.reply(beautified.slice(i, i + 2000));
    }
  } catch (error) {
    console.error('Error processing Discord message:', error);
    await message.reply('Sorry, there was an error processing your request.');
  }
});

client.once('clientReady', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);
