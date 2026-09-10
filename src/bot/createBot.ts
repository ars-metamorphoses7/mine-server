import mineflayer, { type Bot } from "mineflayer";
import { pathfinder } from "mineflayer-pathfinder";
import { config } from "../config.js";

export function createCompanionBot(): Bot {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: config.auth
  });

  bot.loadPlugin(pathfinder);
  return bot;
}
