import {
  CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollow,
  handlerFollowing,
middlewareLoggedIn,handlerUnfollow,
} from "./commands";
async function main() {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
registerCommand(registry, "reset", handlerReset);
registerCommand(registry, "agg", handlerAgg); 
registerCommand(registry, "users", handlerUsers);
registerCommand(registry, "feeds", handlerFeeds);
registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));  
registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }
}

main();
