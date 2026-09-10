import { createCompanionBot } from "./bot/createBot.js";
import { registerCommands } from "./bot/commands.js";
import { config } from "./config.js";
import { AgentControlPlane } from "./agent/controlPlane.js";

const bot = createCompanionBot();
const controlPlane = new AgentControlPlane(bot);

bot.once("login", () => {
  console.log(`[companion] connected to ${config.host}:${config.port} as ${config.username}`);
  void controlPlane.start();
  void controlPlane.emitEvent("login", { host: config.host, port: config.port });
});

bot.once("spawn", () => {
  console.log("[companion] spawned in the world");
  bot.chat("LunaCompanion online. Use !ping, !come, !status ou !stop.");
  void controlPlane.emitEvent("spawn");
});

registerCommands(bot);

bot.on("kicked", (reason) => {
  console.error("[companion] kicked:", reason);
  void controlPlane.emitEvent("kicked", { reason });
});

bot.on("error", (error) => {
  console.error("[companion] error:", error);
  void controlPlane.emitEvent("error", { message: error.message });
});

bot.on("end", () => {
  console.log("[companion] connection ended");
  void controlPlane.emitEvent("end");
  void controlPlane.stop();
});
