import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import cursors from "../datastores/cursors.ts";
//import people from "../datastores/activeuser.ts";

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
        wentthrough += first.members.length;
        let notfound = true;
        let cursor = first.response_metadata?.next_cursor;
        for (let i = 0; i < 15 && notfound; i++) {
          const next = await client.users.list({
            limit: 1000,
            team_id: teamid,
            cursor: cursor,
          });
          const prevWentthrough = wentthrough;
          wentthrough += next.members.length;
          const members = next.members;
          if (number < wentthrough) {
            let index = number - prevWentthrough - 1;
            if (index < 0) index = 0;
            while (index >= 0 && !(members[index] && members[index].id)) {
              index--;
            }
            if (index < 0) {
              index = number - prevWentthrough - 1;
              while (index < members.length && !(members[index] && members[index].id)) {
                index++;
              }
            }
            console.log("index:", index);
            const chosen = next.members[(index-1)].id;
            await client.chat.postMessage({
              channel: channel,
              text: `<@${user}> has chosen <@${chosen}> with that roll.`,
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
        const prevWentthrough = wentthrough;
        wentthrough += first.members.length;
        const members = first.members;
        let index = number - prevWentthrough - 1;
        if (index < 0) index = 0;
        while (index >= 0 && !(members[index] && members[index].id)) {
          index--;
        }
        if (index < 0) {
          index = number - prevWentthrough - 1;
          while (index < members.length && !(members[index] && members[index].id)) {
            index++;
          }
        }
        const chosen = first.members[index].id;
        console.log("fifth check");
        const message = await client.chat.postMessage({
          channel: channel,
          text: `<@${user}> has chosen <@${chosen}> with that roll.`,
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
    
    /*const get1 = await client.apps.datastore.get<
      typeof cursors.definition
    >({
      datastore: cursors.name,
      id: "Initialize",
    });
    if (get1.item.rolling) {
      let number = get1.item.number;
      let wentthrough = get1.item.wentthrough;
      const first = await client.users.list({
        team_id: teamid,
        limit: 200,
      });
      let whotocheck = first;
      if (get1.item.cursor != "none") {
        whotocheck = await client.users.list({
          team_id: teamid,
          limit: 200,
          cursor: get1.item.cursor,
        });
      }
      number = first.members.length;
      let cursor = get1.item.cursor;
      if (first.response_metadata?.next_cursor) {
        cursor = first.response_metadata?.next_cursor;
      } else {
        cursor = "finished";
      }
      
      for (let i = 0; i < 8; i++) {
        console.log("got here");
        if (!whotocheck?.members) {
          continue;
        }
        if (wentthrough >= whotocheck.members.length) {
          if (cursor == "finished") {
            await client.chat.postEphemeral({
              channel: get1.item.channel,
              user: get1.item.user,
              text: "finished",
            });
            await client.apps.datastore.update<
              typeof cursors.definition
            >({
              datastore: cursors.name,
              item: {
                type: "Initialize",
                cursor: "none",
                number: 0,
                wentthrough: 0,
                rolling: false,
              },
            });
          }
          wentthrough = 0;
          const next = await client.users.list({
            team_id: teamid,
            limit: 200,
            cursor: cursor,
          });
          number = next.members.length;
          whotocheck = next;
          if (next.response_metadata?.next_cursor) {
            cursor = next.response_metadata?.next_cursor;
          } else {
            cursor = "finished";
          }
          continue;
        }
        const currentMember = whotocheck.members[wentthrough];
        if (currentMember.deleted === true || currentMember.is_restricted === true) {
          i--;
          wentthrough++;
          continue;
        }
        wentthrough++;
        let rep = await client.reactions.list({
          user: whotocheck.members[wentthrough].id,
          team_id: teamid,
          count: 100,
          limit: 10,
        });
        console.log(rep);
        if (rep.response_metadata?.next_cursor) {
          rep = await client.reactions.list({
            user: whotocheck.members[wentthrough].id,
            team_id: teamid,
            count: 100,
            limit: 10,
            cursor: rep.response_metadata?.next_cursor,
          });
        }
        console.log(rep);
        if (rep?.items && rep.items.length > 0) {
          let slackTs = "0000000";
          if (rep.items[0]?.type == "message") {
            slackTs = rep.items[0].message.ts;
          } else if (rep.items[0].comment?.type == "file_comment") {
            slackTs = rep.items[0].comment?.timestamp;
          } else if (rep.items[0]?.file?.created) {
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
        if (wentthrough == number) {
          if (cursor == "finished") {
            await client.chat.postEphemeral({
              channel: get1.item.channel,
              user: get1.item.user,
              text: "finished",
            });
            await client.apps.datastore.update<
              typeof cursors.definition
            >({
              datastore: cursors.name,
              item: {
                type: "Initialize",
                cursor: "none",
                number: 0,
                wentthrough: 0,
                rolling: false,
              },
            });
          }
          wentthrough = 0;
          const next = await client.users.list({
            team_id: teamid,
            limit: 200,
            cursor: cursor,
          });
          number = next.members.length;
          whotocheck = next;
          await client.apps.datastore.update<
            typeof cursors.definition
          >({
            datastore: cursors.name,
            item: {
              type: "Initialize",
              cursor: cursor,
            },
          });
          if (next.response_metadata?.next_cursor) {
            cursor = next.response_metadata?.next_cursor;
          } else {
            cursor = "finished";
          }
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
        channel: get1.item.channel,
        user: get1.item.user,
        text: "still going",
      });
    }*/
    return { outputs: {} };
  },
);
