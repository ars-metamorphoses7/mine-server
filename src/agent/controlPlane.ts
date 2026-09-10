import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Bot } from "mineflayer";
import { goals } from "mineflayer-pathfinder";
import { config } from "../config.js";

const { GoalFollow, GoalNear } = goals;

export type AgentAction =
  | { type: "chat"; message: string }
  | { type: "follow"; username: string; distance?: number }
  | { type: "goto"; x: number; y: number; z: number; distance?: number }
  | { type: "stop" };

type WorldState = {
  timestamp: string;
  connected: boolean;
  spawned: boolean;
  bot: {
    username: string;
    position: { x: number; y: number; z: number } | null;
    health: number | null;
    food: number | null;
  };
  players: Array<{
    username: string;
    position: { x: number; y: number; z: number } | null;
  }>;
  nearbyEntities: Array<{
    name: string;
    type: string;
    position: { x: number; y: number; z: number };
  }>;
};

export class AgentControlPlane {
  private readonly runtimeDir = path.resolve(config.runtimeDir);
  private readonly actionsPath = path.join(this.runtimeDir, "actions.jsonl");
  private readonly eventsPath = path.join(this.runtimeDir, "events.jsonl");
  private readonly statePath = path.join(this.runtimeDir, "world-state.json");
  private processedActionLines = 0;
  private pollTimer: NodeJS.Timeout | undefined;

  constructor(private readonly bot: Bot) {}

  async start(): Promise<void> {
    await mkdir(this.runtimeDir, { recursive: true });
    await appendFile(this.actionsPath, "", "utf8");
    await appendFile(this.eventsPath, "", "utf8");
    await this.writeWorldState();

    this.pollTimer = setInterval(() => {
      void this.pollActions();
      void this.writeWorldState();
    }, 500);
  }

  async stop(): Promise<void> {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = undefined;
    await this.writeWorldState();
  }

  async emitEvent(type: string, data: Record<string, unknown> = {}): Promise<void> {
    await mkdir(this.runtimeDir, { recursive: true });
    await appendFile(
      this.eventsPath,
      `${JSON.stringify({ timestamp: new Date().toISOString(), type, ...data })}\n`,
      "utf8"
    );
  }

  private async pollActions(): Promise<void> {
    let contents: string;

    try {
      contents = await readFile(this.actionsPath, "utf8");
    } catch {
      return;
    }

    const lines = contents.split("\n").filter(Boolean);
    const newLines = lines.slice(this.processedActionLines);
    this.processedActionLines = lines.length;

    for (const line of newLines) {
      try {
        await this.execute(JSON.parse(line) as AgentAction);
      } catch (error) {
        await this.emitEvent("action_error", {
          line,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  private async execute(action: AgentAction): Promise<void> {
    switch (action.type) {
      case "chat":
        this.bot.chat(action.message.slice(0, 256));
        await this.emitEvent("action_executed", { action });
        return;

      case "follow": {
        const player = this.bot.players[action.username]?.entity;
        if (!player) throw new Error(`Player not found: ${action.username}`);
        this.bot.pathfinder.setGoal(new GoalFollow(player, action.distance ?? 2), true);
        await this.emitEvent("action_executed", { action });
        return;
      }

      case "goto":
        this.bot.pathfinder.setGoal(
          new GoalNear(action.x, action.y, action.z, action.distance ?? 2)
        );
        await this.emitEvent("action_executed", { action });
        return;

      case "stop":
        this.bot.pathfinder.setGoal(null);
        await this.emitEvent("action_executed", { action });
        return;

      default:
        throw new Error("Unknown agent action");
    }
  }

  private async writeWorldState(): Promise<void> {
    const state: WorldState = {
      timestamp: new Date().toISOString(),
      connected: this.bot.player !== undefined,
      spawned: this.bot.entity !== undefined,
      bot: {
        username: this.bot.username,
        position: this.bot.entity ? positionOf(this.bot.entity.position) : null,
        health: this.bot.health ?? null,
        food: this.bot.food ?? null
      },
      players: Object.values(this.bot.players).map((player) => ({
        username: player.username,
        position: player.entity ? positionOf(player.entity.position) : null
      })),
      nearbyEntities: Object.values(this.bot.entities)
        .filter((entity) => entity !== this.bot.entity && entity.position)
        .slice(0, 30)
        .map((entity) => ({
          name: entity.name ?? "unknown",
          type: entity.type,
          position: positionOf(entity.position)
        }))
    };

    await writeFile(this.statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }
}

function positionOf(position: { x: number; y: number; z: number }) {
  return {
    x: Math.round(position.x * 100) / 100,
    y: Math.round(position.y * 100) / 100,
    z: Math.round(position.z * 100) / 100
  };
}
