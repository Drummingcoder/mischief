import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import people from "../datastores/activeuser.ts";

export const bruhactive = DefineFunction({
  callback_id: "activpls",
  title: "Please show",
  description: "Waah active people pls",
  source_file: "functions/activerandom.ts",
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
  bruhactive,
  async ({ inputs, client }) => {
    const get = await client.apps.datastore.get<
      typeof people.definition
    >({
      datastore: people.name,
      id: "0",
    });
    const random = Math.floor(Math.random() * (get.item.length) + 1);

    const get1 = await client.apps.datastore.get<
      typeof people.definition
    >({
      datastore: people.name,
      id: random.toString(),
    });

    await client.chat.postMessage({
      channel: inputs.channel,
      text: `<@${inputs.user}> has chosen <@${get1.item.user_id}> with that roll.`
    });
    
    return { outputs: {} };
  },
);
