import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
//import cursors from "../datastores/cursors.ts";
import people from "../datastores/activeuser.ts";

export const notactive = DefineFunction({
  callback_id: "jafdj",
  title: "IOUFO",
  description: "Time to play around rate limits",
  source_file: "functions/test.ts",
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
  notactive,
  async ({ inputs, client }) => {
    
    const get = await client.apps.datastore.get<
      typeof people.definition
    >({
      datastore: people.name,
      id: "0",
    });

    for (let i = 1; i < get.item.length; i++) {
      const get1 = await client.apps.datastore.get<
        typeof people.definition
      >({
        datastore: people.name,
        id: i.toString(),
      });
      if (get1.item.user_id == inputs.user) {
        await client.chat.postEphemeral({
          channel: inputs.channel,
          user: inputs.user,
          text: "already registered",
        });
        return {outputs: {}};
      }
    }
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
          user_id: inputs.user
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
          user_id: inputs.user
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
          
    return { outputs: {} };
  },
);
