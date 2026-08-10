// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import assert from "node:assert/strict";
import test from "node:test";
import { getSetupReport } from "../lib/setup/checks.ts";
import {
  environmentDefinitions,
  getConfigurationChecks,
  getMissingEnvironmentNames,
} from "../lib/setup/environment.ts";

const completeEnvironment = {
  SUPABASE_URL: "https://course-example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "publishable-test-value",
  SUPABASE_SECRET_KEY: "secret-test-value",
  TELEGRAM_BOT_TOKEN: "telegram-test-value",
  OPENAI_API_KEY: "openai-test-value",
};

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
