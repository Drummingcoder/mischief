import { Manifest } from "deno-slack-sdk/mod.ts";
import random from "./workflows/randomizer.ts";
import contin from "./workflows/contrandom.ts";
import cursors from "./datastores/cursors.ts";
import people from "./datastores/activeuser.ts";
import randomactive from "./workflows/randomizer_active.ts";
import initial from "./workflows/initial.ts";

export default Manifest({
  name: "default-bunny",
  description: "What the- what are these buttons?",
  icon: "assets/default_new_app_icon.png",
  workflows: [random, contin, randomactive, initial],
  outgoingDomains: [],
  datastores: [cursors, people],
  botScopes: ["commands","chat:write","chat:write.public","datastore:read", "datastore:write", "users:read", "channels:history", "groups:history", "reactions:read"],
});
