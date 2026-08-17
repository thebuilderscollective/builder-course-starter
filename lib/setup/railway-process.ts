// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

export type RailwayProcessOptions = {
  input?: string;
  capture?: boolean;
};

export type RailwayStdio = [
  "pipe" | "inherit",
  "pipe" | "inherit",
  "pipe" | "inherit",
];

export function getRailwayStdio(
  options: RailwayProcessOptions,
): RailwayStdio {
  if (options.capture) {
    return ["pipe", "pipe", "pipe"];
  }

  return [
    options.input === undefined ? "inherit" : "pipe",
    "inherit",
    "inherit",
  ];
}
