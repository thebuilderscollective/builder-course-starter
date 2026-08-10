<!-- Copyright (c) 2026 The Builder Course and Rajat. All rights reserved. -->

# A beginner's tour of this repository

Imagine you and a friend are building this setup checker together. You work on
different laptops and sometimes ask a coding agent—ChatGPT Codex or Claude
Code—to help. The repository gives all three of you the same starting point.

## Repository, Git, and GitHub

- The **repository** is this project folder plus its saved history.
- **Git** records that history on your computer as named checkpoints called commits.
- **GitHub** stores a shared copy so another person can clone, review, pull, and push.

A branch is a safe side path. If a coding agent changes several files and the
checker stops working, Git lets you compare the branch with the last working
commit instead of guessing which file caused the problem.

## Why these files exist

| File | First question it answers |
| --- | --- |
| `README.md` | What is this project, and how do I run it? |
| `AGENTS.md` | What rules should a coding agent follow? |
| `CLAUDE.md` | How does Claude Code receive those same rules? |
| `.env.example` | Which private-value names does the project require? |
| `.env.local` | Where do my real values stay on this computer? |
| `.gitignore` | Which local or generated files must Git leave out? |
| `package.json` | Which repeatable commands can everyone run? |
| `railway.toml` | How should Railway build, start, and check the app? |
| `.github/workflows/check.yml` | Which checks should GitHub repeat after a push? |

`.env.example` is shared because it contains names only. `.env.local` is not
shared because it contains real values. The leading dot makes both files easy
to miss in Finder or File Explorer, so use VS Code's Explorer to see them.

## Why this Node.js project uses npm

This is a Node.js application, so its shared command vocabulary lives in
`package.json`: `npm run setup`, `npm run dev`, `npm test`, and `npm run check`.

Those tools are alternatives, not layers you add everywhere:

- A Node.js project commonly uses npm scripts.
- A Python project can use uv and `pyproject.toml`.
- A Makefile can wrap commands for any language on a machine with Make installed.

Pick one primary command vocabulary and write it in both `README.md` and
`AGENTS.md`. A new teammate or coding agent should not have to reconstruct setup
steps from an old chat.

## Pull, change, commit, and push

Suppose your friend improves the checker and pushes a commit to GitHub. Your
laptop does not receive it automatically.

1. `git pull` brings the shared commit down from GitHub.
2. Create a branch for your work.
3. Make a small change and review the diff.
4. `git commit` records a named local checkpoint.
5. `git push` sends that commit up to GitHub for review.

## How repeatable commands become CI/CD

Today you run `npm run check` and `npm run deploy:railway` yourself. The GitHub
Actions file shows the next step: continuous integration (CI) runs the same
checks on a clean computer after code is pushed. If a check fails, the team sees
the failure before deploying it. Later, continuous deployment (CD) can publish
only commits that passed those checks.

Automation is the repository's saved checklist running somewhere else.
