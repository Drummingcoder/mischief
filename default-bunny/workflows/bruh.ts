import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { notactive } from "../functions/test.ts";

const yououo = DefineWorkflow({
  callback_id: "ihe2",
  title: "dlkfja",
  description: "Who to roll...",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      }
    },
    required: ["user", "channel", "interactivity"],
  },
});

const form = yououo.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Active?",
    interactivity: yououo.inputs.interactivity,
    submit_label: "Add",
    fields: {
      elements: [{
        name: "user",
        title: "Active user",
        type: Schema.slack.types.user_id,
      }],
      required: ["user"],
    },
  },
);

yououo.addStep(notactive, {
  user: form.outputs.fields.user,
  channel: yououo.inputs.channel,
});

export default yououo;
