import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { whoactive } from "../functions/initactive.ts";

const initial = DefineWorkflow({
  callback_id: "whoactive",
  title: "Whose active",
  description: "Who to call in Hack Club...",
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

initial.addStep(whoactive, {
  user: initial.inputs.user,
  channel: initial.inputs.channel,
});

export default initial;
