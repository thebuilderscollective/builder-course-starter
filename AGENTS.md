<!-- Copyright (c) 2026 The Builder Course and Rajat. All rights reserved. -->

# Repository instructions

## Project

This repository is only a pre-work setup checker for The Builder Course.
Do not add course-product features, authentication, database writes, Telegram
messages, Gmail or Calendar access, or OpenAI generation.

## Approved commands

- Setup: `npm run setup`
- Develop: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Full verification: `npm run check`
- Railway deployment: `npm run deploy:railway`

## Working agreements

- Never read `.env.local` into chat or print any environment value.
- Never commit `.env.local`, `.railway`, `node_modules`, or `.next`.
- Keep service checks read-only. Do not add a database query, Telegram send,
  OpenAI generation, Gmail read, or Calendar read as a readiness test.
- Return general failure messages. Never include response bodies, request URLs
  containing tokens, authorization headers, secret prefixes, or stack traces.
- Keep the page understandable for a learner with no prior engineering experience.
- Prefer a small, explicit TypeScript function over a new dependency.

## Definition of done

Run `npm run check`. Review the Git diff. Confirm no secret or generated build
output is present. A change is not complete merely because files were edited.
