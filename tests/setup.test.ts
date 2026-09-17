// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { getSetupReport } from "../lib/setup/checks.ts";
import {
  environmentDefinitions,
  getConfigurationChecks,
  getMissingEnvironmentNames,
} from "../lib/setup/environment.ts";
import { getRailwayStdio } from "../lib/setup/railway-process.ts";

const completeEnvironment = {
  SUPABASE_URL: "https://course-example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "publishable-test-value",
  SUPABASE_SECRET_KEY: "secret-test-value",
  TELEGRAM_BOT_TOKEN: "telegram-test-value",
  OPENAI_API_KEY: "openai-test-value",
};

test("setup checker branding is reusable across cohorts", async () => {
  const brandingModule = await import("../lib/setup/branding.ts").catch(() => null);

  assert.ok(brandingModule, "expected shared setup-checker branding");
  assert.equal(
    /cohort\s*\d/i.test(JSON.stringify(brandingModule.setupCheckerBranding)),
    false,
  );
  assert.equal(
    brandingModule.setupCheckerBranding.shortLabel,
    "Builder Course setup checker",
  );
});

test("the environment template has exactly the five course values", () => {
  assert.deepEqual(
    environmentDefinitions.map((definition) => definition.name),
    [
      "SUPABASE_URL",
      "SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SECRET_KEY",
      "TELEGRAM_BOT_TOKEN",
      "OPENAI_API_KEY",
    ],
  );
});

test("blank or whitespace-only values are missing", () => {
  const environment = { SUPABASE_URL: "   " };
  const configuration = getConfigurationChecks(environment);

  assert.equal(configuration.every((check) => check.state === "missing"), true);
  assert.equal(getMissingEnvironmentNames(environment).length, 5);
});

test("external checks wait and make no requests while values are missing", async () => {
  let requestCount = 0;
  const fetcher: typeof fetch = async () => {
    requestCount += 1;
    return new Response(null, { status: 200 });
  };

  const report = await getSetupReport({}, fetcher);

  assert.equal(requestCount, 0);
  assert.equal(report.complete, false);
  assert.deepEqual(
    report.connections.map((check) => check.state),
    ["waiting", "waiting", "waiting", "manual"],
  );
});

test("complete values and successful read-only requests produce a ready report", async () => {
  const requestedUrls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    requestedUrls.push(String(input));
    return new Response(null, { status: 200 });
  };

  const report = await getSetupReport(completeEnvironment, fetcher);

  assert.equal(report.complete, true);
  assert.equal(requestedUrls.length, 3);
  assert.equal(requestedUrls.some((url) => url.includes("secret-test-value")), false);
  assert.equal(requestedUrls.some((url) => url.includes("openai-test-value")), false);
  assert.equal(JSON.stringify(report).includes("test-value"), false);
});

test("Supabase checks the public auth settings endpoint with the apikey header", async () => {
  const requests: Array<{ input: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push({ input: String(input), init });
    return new Response(null, { status: 200 });
  };

  await getSetupReport(completeEnvironment, fetcher);

  const supabaseRequest = requests.find((request) =>
    request.input.includes("course-example.supabase.co"),
  );
  assert.ok(supabaseRequest);
  assert.equal(
    supabaseRequest.input,
    "https://course-example.supabase.co/auth/v1/settings",
  );
  assert.deepEqual(supabaseRequest.init?.headers, {
    apikey: "publishable-test-value",
  });
});

test("Supabase rejects a project URL containing an API path", async () => {
  const requestedUrls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    requestedUrls.push(String(input));
    return new Response(null, { status: 200 });
  };

  const report = await getSetupReport(
    {
      ...completeEnvironment,
      SUPABASE_URL: "https://course-example.supabase.co/rest/v1",
    },
    fetcher,
  );
  const supabase = report.connections.find((check) => check.id === "supabase");

  assert.ok(supabase);
  assert.equal(supabase.state, "failed");
  assert.equal(
    supabase.detail,
    "Use the project URL only, such as https://PROJECT-REF.supabase.co. Do not add /rest/v1.",
  );
  assert.equal(
    requestedUrls.some((url) => url.includes("course-example.supabase.co")),
    false,
  );
});

test("failed services return general guidance without exposing private values", async () => {
  const fetcher: typeof fetch = async () => new Response(null, { status: 401 });
  const report = await getSetupReport(completeEnvironment, fetcher);
  const serialized = JSON.stringify(report);

  assert.equal(report.complete, false);
  assert.equal(report.connections.filter((check) => check.state === "failed").length, 3);
  assert.equal(serialized.includes("telegram-test-value"), false);
  assert.equal(serialized.includes("openai-test-value"), false);
  assert.equal(serialized.includes("secret-test-value"), false);
});

test("Railway receives private values through stdin without losing interactive input", () => {
  assert.deepEqual(getRailwayStdio({}), ["inherit", "inherit", "inherit"]);
  assert.deepEqual(getRailwayStdio({ capture: true }), ["pipe", "pipe", "pipe"]);
  assert.deepEqual(getRailwayStdio({ input: "private-test-value" }), [
    "pipe",
    "inherit",
    "inherit",
  ]);

  const privateValue = "private-test-value";
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'let value = ""; process.stdin.setEncoding("utf8"); for await (const chunk of process.stdin) value += chunk; process.exit(value === "private-test-value" ? 0 : 1);',
    ],
    {
      input: privateValue,
      stdio: getRailwayStdio({ input: privateValue }),
    },
  );

  assert.equal(child.status, 0);
});
