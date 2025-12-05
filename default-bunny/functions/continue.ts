import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import roll from "../datastores/cursors.ts";

export const pulling = DefineFunction({
  callback_id: "keepgo",
  title: "Let's go",
  description: "More rolling please",
  source_file: "functions/random.ts",
  input_parameters: {
    properties: {
    },
    required: [],
  }
});

export default SlackFunction(
  pulling,
  async ({ client }) => {
    const get = await client.apps.datastore.get<
      typeof roll.definition
    >({
      datastore: roll.name,
      id: "User",
    });
    if (get.item.rolling) {
      let wentthrough = get.item.wentthrough;
      const number = get.item.number;
      const channel = get.item.channel;
      const user = get.item.user;
      if (number > 1000) {
        const first = await client.users.list({
          limit: 1000,
        });
        wentthrough += 1000;
        let notfound = true;
        let cursor = first.response_metadata?.next_cursor;
        for (let i = 0; i < 19 && notfound; i++) {
          const next = await client.users.list({
            limit: 1000,
            cursor: cursor,
          });
          wentthrough += 1000;
          if (number < wentthrough) {
            const index = wentthrough - number;
            const chosen = next.members[(index-1)].id;
            await client.chat.postMessage({
              channel: channel,
              text: `You have chosen <@${chosen}> with that roll.`,
            });
            notfound = false;
            await client.apps.datastore.put<
              typeof roll.definition
            >({
              datastore: roll.name,
              item: {
                type: "User",
                cursor: "none",
                number: 0,
                wentthrough: 0,
                channel: "",
                user: "",
                rolling: false,
              },
            });
            return { outputs: {} };
          }
          cursor = next.response_metadata?.next_cursor;
        }
        await client.chat.postEphemeral({
          channel: channel,
          user: user,
          text: `Your number was greater than ${wentthrough}, so to avoid rate limit, waiting for a minute here.`
        });
        await client.apps.datastore.update<
          typeof roll.definition
        >({
          datastore: roll.name,
          item: {
            type: "User",
            cursor: cursor,
            wentthrough: wentthrough,
          },
        });
      } else {
        const first = await client.users.list({
          limit: 1000,
        });
        const chosen = first.members[(number-1)].id;
        await client.chat.postMessage({
          channel: channel,
          text: `You have chosen <@${chosen}> with that roll.`,
        });
        await client.apps.datastore.put<
          typeof roll.definition
        >({
          datastore: roll.name,
          item: {
            type: "User",
            cursor: "none",
            number: 0,
            wentthrough: 0,
            channel: "",
            user: "",
            rolling: false,
          },
        });
      }
    }
    return { outputs: {} };
  },
);
