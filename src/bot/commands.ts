import type { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";

const { GoalFollow } = goals;

function reply(bot: Bot, username: string, message: string): void {
  bot.chat(`${username}: ${message}`);
}

export function registerCommands(bot: Bot): void {
  bot.on("chat", (username, message) => {
    if (username === bot.username || !message.startsWith("!")) return;

    const [command] = message.trim().split(/\s+/);
    const player = bot.players[username]?.entity;

    switch (command.toLowerCase()) {
      case "!ping":
        reply(bot, username, "pong — eu estou online.");
        break;

      case "!status":
        reply(
          bot,
          username,
          `posição ${formatPosition(bot)}; ${bot.pathfinder.isMoving() ? "em movimento" : "parado"}.`
        );
        break;

      case "!come":
        if (!player) {
          reply(bot, username, "não consigo te localizar agora.");
          break;
        }

        bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
        reply(bot, username, "indo até você.");
        break;

      case "!stop":
        bot.pathfinder.setGoal(null);
        reply(bot, username, "parei.");
        break;

      default:
        break;
    }
  });
}

function formatPosition(bot: Bot): string {
  const position = bot.entity.position;
  return `${Math.floor(position.x)}, ${Math.floor(position.y)}, ${Math.floor(position.z)}`;
}
