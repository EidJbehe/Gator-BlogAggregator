import {
  CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin,
} from "./commands";

function main() {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }
}

main();
