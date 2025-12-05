import { Manifest } from "deno-slack-sdk/mod.ts";
import random from "./workflows/randomizer.ts";
import contin from "./workflows/contrandom.ts";
import cursors from "./datastores/cursors.ts";

export default Manifest({
  name: "default-bunny",
  description: "What the- what are these buttons?",
  icon: "assets/default_new_app_icon.png",
  workflows: [random, contin],
  outgoingDomains: [],
  datastores: [cursors],
  botScopes: ["commands","chat:write","chat:write.public","datastore:read", "datastore:write", "users:read", "channels:history", "groups:history"],
});
