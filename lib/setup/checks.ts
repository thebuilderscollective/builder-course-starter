// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import {
  getConfigurationChecks,
  hasEnvironmentValue,
  type ConfigurationCheck,
  type Environment,
  type EnvironmentName,
} from "./environment.ts";

export type ConnectionState = "connected" | "failed" | "waiting" | "manual";

export type ConnectionCheck = {
  id: "supabase" | "telegram" | "openai" | "google-cloud";
  label: string;
  state: ConnectionState;
  detail: string;
};

export type SetupReport = {
  configuration: ConfigurationCheck[];
  connections: ConnectionCheck[];
  complete: boolean;
};

type Fetcher = typeof fetch;

const timeoutMilliseconds = 6_000;

function hasAll(
  environment: Environment,
  names: readonly EnvironmentName[],
): boolean {
  return names.every((name) => hasEnvironmentValue(environment, name));
}

function isSupabaseProjectUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

async function requestSucceeded(
  fetcher: Fetcher,
  input: string,
  init: RequestInit,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);

  try {
    const response = await fetcher(input, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkSupabase(
  environment: Environment,
  fetcher: Fetcher,
): Promise<ConnectionCheck> {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ] as const;

  if (!hasAll(environment, required)) {
    return {
      id: "supabase",
      label: "Supabase",
      state: "waiting",
      detail: "Add all three Supabase values before this check can run.",
    };
  }

  const projectUrl = environment.SUPABASE_URL!.trim().replace(/\/$/, "");
  const publishableKey = environment.SUPABASE_PUBLISHABLE_KEY!.trim();

  if (!isSupabaseProjectUrl(projectUrl)) {
    return {
      id: "supabase",
      label: "Supabase",
      state: "failed",
      detail:
        "Use the project URL only, such as https://PROJECT-REF.supabase.co. Do not add /rest/v1.",
    };
  }

  const connected = await requestSucceeded(
    fetcher,
    `${projectUrl}/auth/v1/settings`,
    {
      method: "GET",
      headers: { apikey: publishableKey },
    },
  );

  return {
    id: "supabase",
    label: "Supabase",
    state: connected ? "connected" : "failed",
    detail: connected
      ? "Supabase accepted the project URL and publishable key."
      : "Supabase did not accept the project URL and publishable key. Recheck both values.",
  };
}

async function checkTelegram(
  environment: Environment,
  fetcher: Fetcher,
): Promise<ConnectionCheck> {
  if (!hasEnvironmentValue(environment, "TELEGRAM_BOT_TOKEN")) {
    return {
      id: "telegram",
      label: "Telegram",
      state: "waiting",
      detail: "Add the bot token before this check can run.",
    };
  }

  const token = environment.TELEGRAM_BOT_TOKEN!.trim();
  const connected = await requestSucceeded(
    fetcher,
    `https://api.telegram.org/bot${token}/getMe`,
    { method: "GET" },
  );

  return {
    id: "telegram",
    label: "Telegram",
    state: connected ? "connected" : "failed",
    detail: connected
      ? "Telegram recognizes the bot token. No message was sent."
      : "Telegram did not recognize the bot token. Create or copy it again in BotFather.",
  };
}

async function checkOpenAi(
  environment: Environment,
  fetcher: Fetcher,
): Promise<ConnectionCheck> {
  if (!hasEnvironmentValue(environment, "OPENAI_API_KEY")) {
    return {
      id: "openai",
      label: "OpenAI",
      state: "waiting",
      detail: "Add the project API key before this check can run.",
    };
  }

  const connected = await requestSucceeded(
    fetcher,
    "https://api.openai.com/v1/models",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${environment.OPENAI_API_KEY!.trim()}` },
    },
  );

  return {
    id: "openai",
    label: "OpenAI",
    state: connected ? "connected" : "failed",
    detail: connected
      ? "OpenAI accepted the project API key. No prompt was submitted."
      : "OpenAI did not accept the project API key. Recheck the key and API billing setup.",
  };
}

export async function getSetupReport(
  environment: Environment,
  fetcher: Fetcher = fetch,
): Promise<SetupReport> {
  const configuration = getConfigurationChecks(environment);
  const connections = await Promise.all([
    checkSupabase(environment, fetcher),
    checkTelegram(environment, fetcher),
    checkOpenAi(environment, fetcher),
  ]);

  connections.push({
    id: "google-cloud",
    label: "Google Cloud",
    state: "manual",
    detail: "Confirm that Gmail API and Google Calendar API show Enabled in your project.",
  });

  return {
    configuration,
    connections,
    complete:
      configuration.every((check) => check.state === "ready") &&
      connections
        .filter((check) => check.state !== "manual")
        .every((check) => check.state === "connected"),
  };
}
