import { readConfig, setUser } from "./config";
import { fetchFeed } from "./rss";
import {
  createUser,
  getUserByName,
  deleteAllUsers,  getUsers
} from "./lib/db/queries/users";
export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();
  console.log("database reset successful");
}
export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}
export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const cfg = readConfig();
  const current = cfg.currentUserName;

  const allUsers = await getUsers();

  for (const user of allUsers) {
    if (current && user.name === current) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}
export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("login command requires a username");
  }

  const username = args[0];

  const user = await getUserByName(username);

  if (!user) {
    throw new Error("user does not exist");
  }

  setUser(username);
  console.log(`user set to ${username}`);
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("register command requires a username");
  }

  const username = args[0];

  const existingUser = await getUserByName(username);

  if (existingUser) {
    throw new Error("user already exists");
  }

  const user = await createUser(username);

  setUser(username);
  console.log(`user created: ${username}`);
  console.log(user);
}
export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
}
