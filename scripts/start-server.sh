#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"
JAR_PATH="${PAPER_JAR:-$SERVER_DIR/paper-1.20.4.jar}"

if [[ ! -f "$JAR_PATH" ]]; then
  echo "Paper jar not found: $JAR_PATH"
  echo "Download Paper 1.20.4 and place it at server/paper-1.20.4.jar."
  exit 1
fi

if [[ ! -f "$SERVER_DIR/eula.txt" ]] || ! grep -q '^eula=true$' "$SERVER_DIR/eula.txt"; then
  echo "Create server/eula.txt with eula=true after accepting the Minecraft EULA."
  exit 1
fi

cd "$SERVER_DIR"
exec java -Xms1G -Xmx2G -jar "$JAR_PATH" nogui
