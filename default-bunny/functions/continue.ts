import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import cursors from "../datastores/cursors.ts";

export const pulling = DefineFunction({
  callback_id: "keepgo",
  title: "Let's go",
  description: "More rolling please",
  source_file: "functions/continue.ts",
  input_parameters: {
    properties: {
    },
    required: [],
  }
});

export default SlackFunction(
  pulling,
  async ({ client }) => {
    const teamid = "T0266FRGM";
    const get = await client.apps.datastore.get<
      typeof cursors.definition
    >({
      datastore: cursors.name,
      id: "User",
    });
    if (get.item.rolling) {
      let wentthrough = get.item.wentthrough;
      const number = get.item.number;
      const channel = get.item.channel;
      const user = get.item.user;
      if ((number - wentthrough) > 1000) {
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
            const index = wentthrough - number;
            console.log("index:", index);
            const chosen = next.members[(index-1)].id;
            await client.chat.postMessage({
              channel: channel,
              text: `You have chosen <@${chosen}> with that roll.`,
            });
            notfound = false;
            const success = await client.apps.datastore.put<
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
            console.log(success);
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
        console.log("fourth check", first);
        const chosen = first.members[(number-1)].id;
        console.log("fifth check");
        const message = await client.chat.postMessage({
          channel: channel,
          text: `You have chosen <@${chosen}> with that roll.`,
        });
        console.log("First: ", first);
        console.log(message);
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
