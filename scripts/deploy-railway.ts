// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import { spawnSync } from "node:child_process";
import { getMissingEnvironmentNames, environmentDefinitions } from "../lib/setup/environment.ts";
import { getRailwayStdio, type RailwayProcessOptions } from "../lib/setup/railway-process.ts";

const railwayPackage = "@railway/cli@5.28.1";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const baseArguments = ["--yes", railwayPackage];

function stop(message: string): never {
  console.error(`Deployment stopped: ${message}`);
  process.exit(1);
}

function railway(
  argumentsForRailway: string[],
  options: RailwayProcessOptions & { allowFailure?: boolean } = {},
): string {
  const result = spawnSync(npxCommand, [...baseArguments, ...argumentsForRailway], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: options.input,
    stdio: getRailwayStdio(options),
  });

  if (result.error || result.status !== 0) {
    if (options.allowFailure) {
      return "";
    }

    stop("Railway could not complete the previous step. Fix the visible Railway error and run the command again.");
  }

  return options.capture ? result.stdout.trim() : "";
}

type RailwayDomain = { domain?: string; url?: string };

function parseDomains(output: string): RailwayDomain[] {
  if (!output) {
    return [];
  }

  try {
    const parsed = JSON.parse(output) as unknown;

    if (Array.isArray(parsed)) {
      return parsed as RailwayDomain[];
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "domains" in parsed &&
      Array.isArray(parsed.domains)
    ) {
      return parsed.domains as RailwayDomain[];
    }
  } catch {
    return [];
  }

  return [];
}

const missing = getMissingEnvironmentNames(process.env);

if (missing.length > 0) {
  stop(`add values for ${missing.join(", ")} in .env.local, then run this command again.`);
}

console.log("1/4 Connecting this repository to Railway…");
railway([
  "up",
  "--yes",
  "--detach",
  "--name",
  "builder-course-starter",
  "--message",
  "Create setup checker service",
]);

console.log("2/4 Transferring five private values without printing them…");
for (const definition of environmentDefinitions) {
  railway(["variable", "set", definition.name, "--stdin", "--skip-deploys"], {
    input: process.env[definition.name]!.trim(),
  });
}

console.log("3/4 Deploying the configured setup checker…");
railway(["up", "--ci", "--message", "Configure setup checker"]);

console.log("4/4 Finding the public URL…");
const domainOutput = railway(["domain", "list", "--json"], {
  capture: true,
  allowFailure: true,
});
const domains = parseDomains(domainOutput);

if (domains.length === 0) {
  railway(["domain", "--json"], { capture: true });
}

const finalDomainOutput = railway(["domain", "list", "--json"], { capture: true });
const finalDomains = parseDomains(finalDomainOutput);
const domain = finalDomains[0]?.domain ?? finalDomains[0]?.url;

if (!domain) {
  stop("the deployment succeeded, but the public Railway domain could not be read. Run `npx @railway/cli domain`.");
}

const publicUrl = domain.startsWith("http") ? domain : `https://${domain}`;
console.log(`Deployment ready: ${publicUrl}`);
console.log("Open that URL and share only the URL and the names of any rows that need attention.");
