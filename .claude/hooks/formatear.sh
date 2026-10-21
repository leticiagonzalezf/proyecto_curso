#!/usr/bin/env bash
# formatear pasa Prettier por el archivo que Claude acaba de crear o editar (hook PostToolUse)

# Saca tool_input.file_path del JSON del hook, que llega por la entrada estandar
FILE_PATH=$(node -e '
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    process.stdout.write(JSON.parse(input).tool_input?.file_path ?? "");
  } catch {
    // Sin un JSON valido no hay ruta que formatear
  }
});
')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Desde la raiz del proyecto, npx usa el Prettier local y respeta .gitignore
cd "$(dirname "$0")/../.." || exit 2

if ! OUTPUT=$(npx prettier --write --ignore-unknown --no-color "$FILE_PATH" 2>&1); then
  echo "Prettier no pudo formatear $FILE_PATH:" >&2
  echo "$OUTPUT" >&2
  exit 2
fi
