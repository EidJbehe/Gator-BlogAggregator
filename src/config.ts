import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig || typeof rawConfig !== "object") {
    throw new Error("invalid config: config is not an object");
  }

  if (typeof rawConfig.db_url !== "string") {
    throw new Error("invalid config: db_url is required and must be a string");
  }

  if (
    rawConfig.current_user_name !== undefined &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("invalid config: current_user_name must be a string");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

export function readConfig(): Config {
  const configFilePath = getConfigFilePath();
  const fileContents = fs.readFileSync(configFilePath, "utf-8");
  const parsedConfig = JSON.parse(fileContents);
  return validateConfig(parsedConfig);
}

export function setUser(userName: string): void {
  const currentConfig = readConfig();
  currentConfig.currentUserName = userName;
  writeConfig(currentConfig);
}
