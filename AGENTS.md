# AGENTS.md

## Project

This directory contains the Hermes IPO frontend application.

## Purpose

- Vite + React + TypeScript UI for the IPO dashboard and management screens
- Connects to the backend FastAPI API
- Displays IPO data, mailing lists, triggers, and dashboard views

## Working conventions

- Use TypeScript and React idioms consistent with the existing Vite app.
- Prefer small, composable components in the feature folders.
- Keep API usage centralized in the app-level client layers when possible.
- Do not hardcode backend URLs or secrets into the frontend code.
- Use environment configuration when needed for deployment and runtime settings.

## Commands

- Install dependencies:
  - `npm install`
- Run locally:
  - `npm run dev`
- Build production bundle:
  - `npm run build`
- Lint:
  - `npm run lint`

## Important files

- `src/main.tsx` — app entry point
- `src/app/App.tsx` — main app shell
- `src/app/api.ts` — API client layer
- `src/features/*` — feature modules and UI screens
- `vite.config.ts` — Vite configuration
- `package.json` — scripts and dependencies

## Safety rules

- Do not commit local env files or developer-only runtime values.
- Keep frontend build output ignored by Git.
- Maintain compatibility with the backend API contract and expected data shapes.
- Prefer reusable components and patterns over ad hoc UI duplication.
