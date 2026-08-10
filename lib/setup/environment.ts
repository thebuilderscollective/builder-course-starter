// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

export const environmentDefinitions = [
  {
    name: "SUPABASE_URL",
    label: "Supabase project URL",
    help: "Connects the checker to the correct Supabase project.",
  },
  {
    name: "SUPABASE_PUBLISHABLE_KEY",
    label: "Supabase publishable key",
    help: "Allows the safe, read-only Supabase connection check.",
  },
  {
    name: "SUPABASE_SECRET_KEY",
    label: "Supabase secret key",
    help: "Confirms the server-only key reached the deployment.",
  },
  {
    name: "TELEGRAM_BOT_TOKEN",
    label: "Telegram bot token",
    help: "Lets Telegram identify the bot without sending a message.",
  },
  {
    name: "OPENAI_API_KEY",
    label: "OpenAI API key",
    help: "Lets OpenAI verify the project key without creating a response.",
  },
] as const;

export type EnvironmentName = (typeof environmentDefinitions)[number]["name"];
export type Environment = Record<string, string | undefined>;

export type ConfigurationCheck = {
  name: EnvironmentName;
  label: string;
  help: string;
  state: "ready" | "missing";
};

export function hasEnvironmentValue(
  environment: Environment,
  name: EnvironmentName,
): boolean {
  return Boolean(environment[name]?.trim());
}

export function getConfigurationChecks(
  environment: Environment,
): ConfigurationCheck[] {
  return environmentDefinitions.map((definition) => ({
    ...definition,
    state: hasEnvironmentValue(environment, definition.name) ? "ready" : "missing",
  }));
}

export function getMissingEnvironmentNames(
  environment: Environment,
): EnvironmentName[] {
  return environmentDefinitions
    .filter((definition) => !hasEnvironmentValue(environment, definition.name))
    .map((definition) => definition.name);
}
