import { Manifest } from "deno-slack-sdk/mod.ts";
import random from "./workflows/randomizer.ts";
import contin from "./workflows/contrandom.ts";
import cursors from "./datastores/cursors.ts";
import people from "./datastores/activeuser.ts";
import randomactive from "./workflows/randomizer_active.ts";
//import initial from "./workflows/initial.ts";
import yououo from "./workflows/bruh.ts";

export default Manifest({
  name: "Jollylight",
  description: "What the- what are these buttons?",
  icon: "assets/jolly.png",
  workflows: [random, contin, randomactive, yououo],
  outgoingDomains: [],
  datastores: [cursors, people],
  botScopes: ["commands","chat:write","chat:write.public","datastore:read", "datastore:write", "users:read", "channels:history", "groups:history", "reactions:read"],
});
