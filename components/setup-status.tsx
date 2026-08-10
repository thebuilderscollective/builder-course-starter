// Copyright (c) 2026 The Builder Course and Rajat. All rights reserved.

import type {
  ConnectionCheck,
  ConnectionState,
  SetupReport,
} from "@/lib/setup/checks";
import type { ConfigurationCheck } from "@/lib/setup/environment";

type DisplayState = ConfigurationCheck["state"] | ConnectionState;

const stateLabels: Record<DisplayState, string> = {
  ready: "Ready",
  missing: "Missing",
  connected: "Connected",
  failed: "Needs attention",
  waiting: "Waiting",
  manual: "Manual check",
};

function StatusRow({
  label,
  detail,
  state,
}: {
  label: string;
  detail: string;
  state: DisplayState;
}) {
  return (
    <li className="status-row">
      <span className={`status-mark status-${state}`} aria-hidden="true" />
      <span className="status-copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </span>
      <span className={`status-label status-${state}`}>{stateLabels[state]}</span>
    </li>
  );
}

export function SetupStatus({ report }: { report: SetupReport }) {
  const attentionCount = [
    ...report.configuration.filter((check) => check.state === "missing"),
    ...report.connections.filter((check) =>
      check.state === "failed" || check.state === "waiting" ? check : false,
    ),
  ].length;

  return (
    <main id="main-content" className="setup-shell">
      <header className="setup-header">
        <div className="brand-lockup" aria-label="The Builder Course">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>
            <strong>The Builder Course</strong>
            <small>Cohort 2 setup checker</small>
          </span>
        </div>
        <span className="scope-label">Setup only</span>
      </header>

      <section className="setup-intro" aria-labelledby="setup-title">
        <p className="intro-label">Your Build Day 1 checkpoint</p>
        <h1 id="setup-title">
          {report.complete
            ? "Your build kit is connected."
            : "Finish the remaining setup checks."}
        </h1>
        <p>
          This page checks configuration and safe connections only. It does not
          read database rows, send Telegram messages, access Gmail or Calendar,
          or create an OpenAI response.
        </p>
        <div className={`result-summary ${report.complete ? "is-complete" : "needs-work"}`}>
          <span className="result-symbol" aria-hidden="true">
            {report.complete ? "✓" : "!"}
          </span>
          <span>
            <strong>{report.complete ? "Setup ready" : `${attentionCount} checks need attention`}</strong>
            <small>
              {report.complete
                ? "Keep the public Railway URL for your Slack check-in."
                : "Open the named setup step, correct it, and reload this page."}
            </small>
          </span>
        </div>
      </section>

      <section className="status-section" aria-labelledby="configuration-title">
        <div className="section-heading">
          <div>
            <h2 id="configuration-title">Configuration received</h2>
            <p>Only presence is reported. Values never appear on this page.</p>
          </div>
          <span>{report.configuration.filter((check) => check.state === "ready").length}/5 ready</span>
        </div>
        <ul className="status-list">
          {report.configuration.map((check) => (
            <StatusRow
              key={check.name}
              label={check.label}
              detail={check.help}
              state={check.state}
            />
          ))}
        </ul>
      </section>

      <section className="status-section" aria-labelledby="connection-title">
        <div className="section-heading">
          <div>
            <h2 id="connection-title">Safe connection checks</h2>
            <p>Three read-only requests and one manual Google Cloud confirmation.</p>
          </div>
        </div>
        <ul className="status-list">
          {report.connections.map((check: ConnectionCheck) => (
            <StatusRow
              key={check.id}
              label={check.label}
              detail={check.detail}
              state={check.state}
            />
          ))}
        </ul>
      </section>

      <footer className="setup-footer">
        <strong>Private by design.</strong>
        <p>
          Share the public URL and the names of any red rows. Never share
          <code>.env.local</code>, an API key, a bot token, or a database secret.
        </p>
      </footer>
    </main>
  );
}
