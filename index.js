import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

dotenv.config();

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v1;
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  const channel = discordClient.channels.cache.get(process.env.CHANNEL_ID);
  let lastTweetId = "";

  async function checkWorldBoss() {
    while (true) {
      // Check for new tweets on the Twitter account https://twitter.com/game8_d4boss
      try {
        const res = await twitterClient.userTimeline("1665642971629486080", {
          exclude_replies: true,
          count: 1,
        });
        // Skip if this is the same tweet we saw last time
        if (res.tweets[0].id === lastTweetId) {
          await new Promise((resolve) => setTimeout(resolve, 300000));
          continue;
        }
        lastTweetId = res.tweets[0].id;
        const message = res.tweets[0].full_text;
        // check if message contains "will spawn"
        if (message.includes("will spawn")) {
          const matches = message.match(/(\d+):(\d+)[ ]+(AM|PM) EST/);
          const time = dayjs(
            `${matches[1]}:${matches[2]} ${matches[3]} -0400`,
            "h:mm A ZZ"
          );
          // Cleanup the message we relay to Discord to remove time and urls
          const filteredMessage = message
            .replace(matches[0], "")
            .replace("()", "")
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
            .replace(/ in (\d+) minutes/, "")
            .replace(/\n\n/g, "\n");
          channel.send(
            `${filteredMessage}\nTime until spawn: ${Math.round(
              (time - dayjs()) / 60000
            )} minutes (<t:${time.unix()}>)`
          );
        }
        // sleep 5 minutes
        await new Promise((resolve) => setTimeout(resolve, 300000));
      } catch (e) {
        console.log(e);
        // In case of error, sleep 5 minutes
        await new Promise((resolve) => setTimeout(resolve, 300000));
        continue;
      }
    }
  }

  checkWorldBoss();
});

discordClient.login(process.env.DISCORD_TOKEN);
