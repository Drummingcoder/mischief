import type { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import random from "../workflows/randomizer.ts";

const sampleTrigger: Trigger<typeof random.definition> = {
  type: TriggerTypes.Shortcut,
  name: "shadowinitbunny",
  description: "Initialize the bot's datastores",
  workflow: `#/workflows/${random.definition.callback_id}`,
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
