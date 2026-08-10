<!-- Copyright (c) 2026 The Builder Course and Rajat. All rights reserved. -->

# Secret-handling contract

- Real values belong only in `.env.local` on the participant's computer and in
  Railway's encrypted service variables.
- The checker reports only `Ready`, `Missing`, `Connected`, `Needs attention`,
  `Waiting`, or `Manual check`.
- Network checks are read-only and discard response bodies.
- Application code must not log environment values, authorization headers,
  token-bearing URLs, response bodies, or raw caught errors.
- If a private value reaches Git, GitHub, Slack, chat, or a screenshot, revoke
  and replace it before continuing.
