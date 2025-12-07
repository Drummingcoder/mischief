import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { nonull } from "../functions/anyrandom.ts";

const randomactive = DefineWorkflow({
  callback_id: "randactive",
  title: "Get active",
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

randomactive.addStep(nonull, {
  user: randomactive.inputs.user,
  channel: randomactive.inputs.channel,
});

export default randomactive;
