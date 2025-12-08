import type { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import yououo from "../workflows/bruh.ts";

const sampleTrigger: Trigger<typeof yououo.definition> = {
  type: TriggerTypes.Shortcut,
  name: "shadowaddactive",
  description: "Add an active person to roll",
  workflow: `#/workflows/${yououo.definition.callback_id}`,
  inputs: {
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    }, 
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    }
  },
};

export default sampleTrigger;
