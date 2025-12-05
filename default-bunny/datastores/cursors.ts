import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const cursors = DefineDatastore({
  name: "keeptrack",
  primary_key: "type",
  attributes: {
    type: {
      type: Schema.types.string,
    },
    cursor: {
      type: Schema.types.string,
    },
    number: {
      type: Schema.types.number,
    },
    wentthrough: {
      type: Schema.types.number,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    user: {
      type: Schema.slack.types.user_id,
    },
    rolling: {
      type: Schema.types.boolean,
    }
  },
});

export default cursors;
