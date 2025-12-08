import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import cursors from "../datastores/cursors.ts";
import people from "../datastores/activeuser.ts";

export const whoactive = DefineFunction({
  callback_id: "initsha",
  title: "What active",
  description: "Time to play around rate limits",
  source_file: "functions/initactive.ts",
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
  whoactive,
  async ({ inputs, client }) => {
    const teamid = "T0266FRGM";
    const otherget = await client.apps.datastore.get<
      typeof cursors.definition
    >({
      datastore: cursors.name,
      id: "User",
    });
    if (otherget.item.rolling) {
      await client.chat.postEphemeral({
        channel: inputs.channel,
        user: inputs.user,
        text: `Sorry, <@${otherget.item.user}> is rolling a user right now.`,
      });
      return { outputs: {} };
    }
    const get = await client.apps.datastore.get<
      typeof cursors.definition
    >({
      datastore: cursors.name,
      id: "ActiveUser",
    });
    if (get.item.rolling) {
      await client.chat.postEphemeral({
        channel: inputs.channel,
        user: inputs.user,
        text: `Sorry, <@${get.item.user}> is rolling a user right now.`,
      });
      return { outputs: {} };
    }
    if (inputs.user == "U091EPSQ3E3") {
      let number = 0;
      let wentthrough = 0;
      await client.apps.datastore.put<
        typeof cursors.definition
      >({
        datastore: cursors.name,
        item: {
          type: "Initialize",
          cursor: "none",
          number: 0,
          wentthrough: 0,
          channel: inputs.channel,
          user: inputs.user,
          rolling: true,
        },
      });
      const first = await client.users.list({
        team_id: teamid,
        limit: 200,
      });
      number = first.members.length;
      let cursor = first.response_metadata?.next_cursor;
      let whotocheck = first;
      for (let i = 0; i < 17; i++) {
        if (whotocheck.members[wentthrough].deleted == true || whotocheck.members[wentthrough].is_restricted == true) {
          i--;
          wentthrough++;
        } else {
          wentthrough++;
          const rep = await client.reactions.list({
            user: whotocheck.members[wentthrough].id,
            team_id: teamid,
          });
          console.log(rep);
          if (rep.items) {
            let slackTs = "0000000";
            if (rep.items[0].type == "message") {
              slackTs = rep.items[0].message.ts;
            } else if (rep.items[0].comment.type == "file_comment") {
              slackTs = rep.items[0].comment.timestamp;
            } else if (rep.items[0].file.created) {
              slackTs = rep.items[0].file.created;
            }
            const olddate = Math.floor(Number(slackTs) * 1000);
            const newdate = Date.now();
            const timeelasped = newdate - olddate;
            const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
            if (timeelasped <= THIRTY_DAYS_IN_MS) {
              const get = await client.apps.datastore.get<
                typeof people.definition
              >({
                datastore: people.name,
                id: "0",
              });
              if (! (get.item.length)) {
                await client.apps.datastore.put<
                  typeof people.definition
                >({
                  datastore: people.name,
                  item: {
                    number: "0",
                    length: 1,
                  },
                });
                await client.apps.datastore.put<
                  typeof people.definition
                >({
                  datastore: people.name,
                  item: {
                    number: "1",
                    user_id: whotocheck.members[wentthrough].id
                  },
                });
              } else {
                const num = get.item.length + 1;
                await client.apps.datastore.put<
                  typeof people.definition
                >({
                  datastore: people.name,
                  item: {
                    number: num.toString(),
                    user_id: whotocheck.members[wentthrough].id
                  },
                });
                await client.apps.datastore.update<
                  typeof people.definition
                >({
                  datastore: people.name,
                  item: {
                    number: "0",
                    length: num,
                  },
                });
              }
            }
          }
        }
        if (wentthrough == number) {
          wentthrough = 0;
          const next = await client.users.list({
            team_id: teamid,
            limit: 200,
            cursor: cursor,
          });
          number = next.members.length;
          await client.apps.datastore.update<
            typeof cursors.definition
          >({
            datastore: cursors.name,
            item: {
              type: "Initialize",
              cursor: cursor,
              number: number,
              wentthrough: 0,
            },
          });
          whotocheck = next;
          cursor = next.response_metadata?.next_cursor;
        }
      }
      await client.apps.datastore.update<
        typeof cursors.definition
      >({
        datastore: cursors.name,
        item: {
          type: "Initialize",
          number: number,
          wentthrough: wentthrough,
        },
      });
      await client.chat.postEphemeral({
        channel: inputs.channel,
        user: inputs.user,
        text: "still going",
      });
    }
    return { outputs: {} };
  },
);
