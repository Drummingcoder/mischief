import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const people = DefineDatastore({
  name: "activity",
  primary_key: "number",
  attributes: {
    number: {
      type: Schema.types.string,
    },
    user_id: {
      type: Schema.types.string,
    },
    length: {
      type: Schema.types.number,
    }
  },
});

export default people;
