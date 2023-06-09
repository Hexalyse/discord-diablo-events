// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  const channel = client.channels.cache.get("765930867771703326");

  // eslint-disable-next-line no-constant-condition
  async function checkWorldBoss() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Check for new tweets on the Twitter account https://twitter.com/game8_d4boss

      // sleep 1 minute
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }

  checkWorldBoss();
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
