import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { pulling } from "../functions/continue.ts";

const contin = DefineWorkflow({
  callback_id: "continit",
  title: "Continue user",
  description: "Time to see whose next",
  input_parameters: {
    properties: {
    },
    required: [],
  },
});

contin.addStep(pulling, {});

export default contin;
