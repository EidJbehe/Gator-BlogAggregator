import { readConfig, setUser } from "./config";import { fetchFeed } from "./rss";import { createFeed, getFeeds, getFeedByUrl } from "./lib/db/queries/feeds";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows";
import type { Feed, User } from "./lib/db/schema";
import {
  createUser,
  getUserByName,
  deleteAllUsers,  getUsers
} from "./lib/db/queries/users";
function printFollow(feedName: string, userName: string) {
  console.log(`${feedName} - ${userName}`);
}
export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();
  console.log("database reset successful");
}
function printFeed(feed: Feed, user: User) {
  console.log(`Feed created:`);
  console.log(`  ID: ${feed.id}`);
  console.log(`  Name: ${feed.name}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  User: ${user.name}`);
  console.log(`  CreatedAt: ${feed.createdAt}`);
  console.log(`  UpdatedAt: ${feed.updatedAt}`);
}
export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allFeeds = await getFeeds();

  for (const feed of allFeeds) {
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${feed.userName}`);
    console.log("--------------------");
  }
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
export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("addfeed command requires a name and a url");
  }

  const name = args[0];
  const url = args[1];

  const cfg = readConfig();
  const currentUser = cfg.currentUserName;
  if (!currentUser) {
    throw new Error("no user is currently logged in");
  }

  const user = await getUserByName(currentUser);
  if (!user) {
    throw new Error("current user does not exist");
  }

  const feed = await createFeed(name, url, user.id);

  // auto-follow after adding a feed
  const follow = await createFeedFollow(user.id, feed.id);

  console.log(follow.feedName);
  console.log(follow.userName);

  printFeed(feed, user);
}
export async function handlerFollow(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("follow command requires a url");
  }

  const url = args[0];

  const cfg = readConfig();
  const currentUserName = cfg.currentUserName;
  if (!currentUserName) {
    throw new Error("no user is currently logged in");
  }

  const user = await getUserByName(currentUserName);
  if (!user) {
    throw new Error("current user does not exist");
  }

  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error("feed does not exist");
  }

  try {
    const follow = await createFeedFollow(user.id, feed.id);
    printFollow(follow.feedName, follow.userName);
  } catch (e: any) {
  
    if (e?.code === "23505") {
      throw new Error("already following");
    }
    throw e;
  }
}
export async function handlerFollowing(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const cfg = readConfig();
  const currentUserName = cfg.currentUserName;
  if (!currentUserName) {
    throw new Error("no user is currently logged in");
  }

  const user = await getUserByName(currentUserName);
  if (!user) {
    throw new Error("current user does not exist");
  }

  const follows = await getFeedFollowsForUser(user.id);

  for (const f of follows) {
    console.log(f.feedName);
  }
}
