import { readConfig, setUser } from "./config";

function main() {
  setUser("Eid Jbehe");
  const config = readConfig();
  console.log(config);
}

main();
