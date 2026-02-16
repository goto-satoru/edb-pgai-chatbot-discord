import 'dotenv/config';
import fetch from "node-fetch";
import { Client, GatewayIntentBits, Partials } from "discord.js";

const { DISCORD_BOT_TOKEN, HM_ACCESS_KEY, GENAI_STRUCTURE_ID, GENAI_BASE_URL, GENAI_KB_ID } = process.env;

if (!DISCORD_BOT_TOKEN) {
  console.error('DISCORD_BOT_TOKEN is not set in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel],
});

async function runStructure(prompt, structureId, user, knowledgeBaseID) {
  try {
    const userId = user.id || user;
    // const threadId = await createOrGetThread(userId);
    const runId = await createStructureRun({ 
      "args": [
        "-p", prompt,
        // "-t", threadId,
        "-k", knowledgeBaseID,
      ]
    }, structureId, userId);
    console.log('Run created:', runId);
    var reply;
    do {
      await new Promise(r => setTimeout(r, 2000));
      reply = await getStructureRunOutput(runId);
    } while(reply.status != 'SUCCEEDED');
    return reply.output.value;
  } catch (error) {
    throw error;
  }
}

async function createStructureRun(data, structureId, userId) {
  console.log('createStructureRun:')
  console.log(' data:       ', data);
  console.log(' structureId:', structureId);
  console.log(' userID:     ', userId);

  console.log('GENAI_BASE_URL:', GENAI_BASE_URL);
  console.log('HM_ACCESS_KEY:', HM_ACCESS_KEY);
  try {
    const url = new URL(`${GENAI_BASE_URL}/api/structures/${structureId}/runs`);
    url.search = new URLSearchParams({
      'path': JSON.stringify({ 'structure_id': `${structureId}` })
    });
    console.log('Request URL:', url.toString());
    console.log('Request Body:', JSON.stringify(data));
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HM_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    console.log('Response Status:', response.status);
    const responseText = await response.text();
    console.log('Response Text:', responseText);
    if (!response.ok) {
      throw new Error(`Error creating structure run: ${response.statusText}`);
    }
    const responseData = JSON.parse(responseText);
    return responseData.structure_run_id;
  } catch (error) {
    console.error('Error creating structure run:', error);
    throw error;
  }
}

async function createOrGetThread(threadId) {
  try {
    const url_get = new URL(`${GENAI_BASE_URL}/api/threads?alias=${threadId}`);
    const response_get = await fetch(url_get, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HM_ACCESS_KEY}`,
        'Content-Type': 'application/json',
        'X-UPM-USER-ID': threadId,
      },
    });
    if(!response_get.ok) {
      throw new Error(`Error getting thread: ${response_get.statusText}`);
    }
    const responseGetData = await response_get.json();
    if(responseGetData.threads === undefined || responseGetData.threads.length == 0) {
      const url_post = new URL(`${GENAI_BASE_URL}/api/threads`);
      const response_post = await fetch(url_post, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HM_ACCESS_KEY}`,
          'Content-Type': 'application/json',
          'X-UPM-USER-ID': threadId,
        },
        body: JSON.stringify({ "name": threadId, "alias": threadId })
      });
      if (!response_post.ok) {
        throw new Error(`Error creating thread: ${response_post.statusText}`);
      }
      const responseData = await response_post.json();
      return responseData.thread_id;
    }
    return responseGetData.threads?.[0]?.thread_id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

async function getStructureRunOutput(runId) {
  try {
    const url = `${GENAI_BASE_URL}/api/structure-runs/${runId}`;
    // userId, userEmailは取得できないため、ダミー値をセット
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HM_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error getting run detail: ${response.statusText}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error getting run detail:', error);
    throw error;
  }
}

// Discord message event handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  try {
    const prompt = message.content;
    const user = { id: message.author.id, username: message.author.username };
    const structureId = GENAI_STRUCTURE_ID;
    const knowledgeBaseID = GENAI_KB_ID;
    const response = await runStructure(prompt, structureId, user, knowledgeBaseID);
    await message.reply(response);
  } catch (error) {
    console.error('Error processing Discord message:', error);
    await message.reply('Sorry, there was an error processing your request.');
  }
});

client.once('clientReady', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);
