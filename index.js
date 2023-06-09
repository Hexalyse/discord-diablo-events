// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

dotenv.config();
// OAuth2 (app-only or user context)
// Create a client with an already known bearer token
const appOnlyClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v1;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  const channel = client.channels.cache.get(process.env.CHANNEL_ID);

  // eslint-disable-next-line no-constant-condition
  async function checkWorldBoss() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Check for new tweets on the Twitter account https://twitter.com/game8_d4boss
      const res = await appOnlyClient
        .userTimeline("1665642971629486080", { exclude: "replies", count: 2 })
        .catch((e) => console.error(e));
      const message = res.tweets[1].full_text;
      const matches = message.match(/(\d+):(\d+)[ ]+(AM|PM) EST/);
      const formatedDate = `${matches[1]}:${matches[2]} ${matches[3]} -0400`;
      const time = dayjs(formatedDate, "h:mm A ZZ", false);
      const filteredMessage = message
        .replace(matches[0], "")
        .replace("()", "")
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
      channel.send(`${filteredMessage}\nLocal time: <t:${time.unix()}>`);
      // sleep 1 minute
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  checkWorldBoss();
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
