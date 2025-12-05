import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { nonull } from "../functions/random.ts";

const random = DefineWorkflow({
  callback_id: "innit",
  title: "Time to get",
  description: "Who to roll...",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      }
    },
    required: ["user", "channel"],
  },
});

random.addStep(nonull, {
  user: random.inputs.user,
  channel: random.inputs.channel,
});

export default random;
