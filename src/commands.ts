import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }

  handler(cmdName, ...args);
}

export function handlerLogin(cmdName: string, ...args: string[]): void {
  if (args.length === 0) {
    throw new Error("login command requires a username");
  }

  const username = args[0];

  setUser(username);

  console.log(`user set to ${username}`);
}
