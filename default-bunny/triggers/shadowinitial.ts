import type { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import initial from "../workflows/initial.ts";

const sampleTrigger: Trigger<typeof initial.definition> = {
  type: TriggerTypes.Shortcut,
  name: "shadowinit",
  description: "Initialize the active user database",
  workflow: `#/workflows/${initial.definition.callback_id}`,
  inputs: {
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    }
  },
};

export default sampleTrigger;
