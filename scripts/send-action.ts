import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const runtimeDir = path.resolve(process.env.RUNTIME_DIR ?? "./runtime");
const [type, ...args] = process.argv.slice(2);

if (!type) {
  console.error("Usage: npm run agent:action -- <chat|follow|goto|stop> [...args]");
  process.exit(1);
}

const action = createAction(type, args);
await mkdir(runtimeDir, { recursive: true });
await appendFile(
  path.join(runtimeDir, "actions.jsonl"),
  `${JSON.stringify(action)}\n`,
  "utf8"
);
console.log(JSON.stringify(action));

function createAction(actionType: string, actionArgs: string[]) {
  switch (actionType) {
    case "chat":
      if (actionArgs.length === 0) throw new Error("chat requires a message");
      return { type: "chat", message: actionArgs.join(" ") };

    case "follow":
      if (!actionArgs[0]) throw new Error("follow requires a username");
      return { type: "follow", username: actionArgs[0] };

    case "goto": {
      const [x, y, z] = actionArgs.map(Number);
      if (![x, y, z].every(Number.isFinite)) {
        throw new Error("goto requires numeric x y z coordinates");
      }
      return { type: "goto", x, y, z };
    }

    case "stop":
      return { type: "stop" };

    default:
      throw new Error(`Unknown action: ${actionType}`);
  }
}
