<!-- Copyright (c) 2026 The Builder Course and Rajat. All rights reserved. -->

# Builder Course starter

This is The Builder Course setup checker. It has one job: prove that your local tools,
five private configuration values, and Railway deployment work together.

It is deliberately not a course application. It does not read database rows,
send Telegram messages, read Gmail or Calendar, or create an OpenAI response.

## What the checker verifies

- All five required names have values without displaying those values.
- Supabase accepts the project URL and publishable key through its public Auth settings endpoint.
- Telegram recognizes the bot token through the read-only `getMe` endpoint.
- OpenAI accepts the API key through the read-only models endpoint.
- Gmail API and Google Calendar API remain a manual confirmation because OAuth
  authorization is configured during the course.

## Start locally

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Run `npm run setup` to create `.env.local` from `.env.example`.
4. Add your five private values to `.env.local` in VS Code.
5. Run `npm run dev`.
6. Open [http://localhost:3000](http://localhost:3000).

You can use Terminal on macOS, PowerShell or Windows Terminal on Windows, or the
terminal inside VS Code. Run project commands from this repository's root—the
folder containing `package.json`.

## Deploy to Railway

Create your account first with the
[course Railway referral link](https://railway.com?referralCode=NCsTX4). Then run:

```bash
npm run deploy:railway
```

The command validates the five names without printing their values, signs you
in to Railway if needed, transfers each value through standard input, deploys
the repository, and prints the public URL. It never uploads `.env.local`.

## Repository commands

| Command | Purpose |
| --- | --- |
| `npm run setup` | Create the private local environment file if it is missing. |
| `npm run dev` | Start the checker locally. |
| `npm test` | Run the setup-checker tests. |
| `npm run lint` | Check code conventions. |
| `npm run typecheck` | Check TypeScript without creating output. |
| `npm run check` | Run every check and make a production build. |
| `npm run deploy:railway` | Validate, configure, and deploy to Railway. |

## Learn from the repository

Read [docs/REPOSITORY-GUIDE.md](docs/REPOSITORY-GUIDE.md) for a beginner-friendly
tour of Git, GitHub, environment files, `AGENTS.md`, repeatable commands, and CI.

## Private values

`.env.example` is the blank form stored and shared with the project.
`.env.local` is your private copy and is excluded from Git. Never paste
`.env.local`, an API key, a bot token, or a database secret into chat, Slack,
screenshots, Git, or GitHub.
