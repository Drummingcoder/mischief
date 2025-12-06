import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import cursors from "../datastores/cursors.ts";

export const nonull = DefineFunction({
  callback_id: "nonull",
  title: "Get user",
  description: "Time to play around rate limits",
  source_file: "functions/random.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
      channel: {
        type: Schema.slack.types.channel_id
      }
    },
    required: ["user", "channel"],
  }
});

export default SlackFunction(
  nonull,
  async ({ inputs, client }) => {
    const teamid = "T0266FRGM";
    const pplInTeam = 114824; // will create some way to change
    const get = await client.apps.datastore.get<
      typeof cursors.definition
    >({
      datastore: cursors.name,
      id: "User",
    });
    if (get.item.rolling) {
      await client.chat.postEphemeral({
        channel: inputs.channel,
        user: inputs.user,
        text: `Sorry, <@${get.item.user}> is rolling a user right now.`,
      });
      return { outputs: {} };
    }
    if (inputs.user != "") {
      const number = Math.round((Math.random()*pplInTeam) + 1);
      let wentthrough = 0;
      await client.apps.datastore.put<
        typeof cursors.definition
      >({
        datastore: cursors.name,
        item: {
          type: "User",
          cursor: "none",
          number: number,
          wentthrough: wentthrough,
          channel: inputs.channel,
          user: inputs.user,
          rolling: true,
        },
      });
      if (number > 1000) {
        const first = await client.users.list({
          limit: 1000,
          team_id: teamid,
        });
        wentthrough += 1000;
        let notfound = true;
        let cursor = first.response_metadata?.next_cursor;
        for (let i = 0; i < 15 && notfound; i++) {
          const next = await client.users.list({
            limit: 1000,
            team_id: teamid,
            cursor: cursor,
          });
          wentthrough += 1000;
          if (number < wentthrough) {
            let index = wentthrough - number;
            while (! (next.members[(index-1)].id)) {
              index--;
            }
            const chosen = next.members[(index-1)].id;
            await client.chat.postMessage({
              channel: inputs.channel,
              text: `<@${inputs.user}> has chosen <@${chosen}> with that roll.`,
            });
            notfound = false;
            await client.apps.datastore.put<
              typeof cursors.definition
            >({
              datastore: cursors.name,
              item: {
                type: "User",
                cursor: "none",
                number: 0,
                wentthrough: 0,
                rolling: false,
              },
            });
            return { outputs: {} };
          }
          cursor = next.response_metadata?.next_cursor;
        }
        await client.chat.postEphemeral({
          channel: inputs.channel,
          user: inputs.user,
          text: `Your number was greater than ${wentthrough}, so to avoid rate limit, waiting for a minute here.`
        });
        await client.apps.datastore.update<
          typeof cursors.definition
        >({
          datastore: cursors.name,
          item: {
            type: "User",
            cursor: cursor,
            wentthrough: wentthrough,
          },
        });
      } else {
        const first = await client.users.list({
          limit: 1000,
          team_id: teamid,
        });
        const chosen = first.members[(number-1)].id;
        await client.chat.postMessage({
          channel: inputs.channel,
          text: `<@${inputs.user}> has chosen <@${chosen}> with that roll.`,
        });
        await client.apps.datastore.put<
          typeof cursors.definition
        >({
          datastore: cursors.name,
          item: {
            type: "User",
            cursor: "none",
            number: 0,
            wentthrough: 0,
            rolling: false,
          },
        });
      }
    }
    return { outputs: {} };
  },
);
