# Project: EventosGC (granhackaria-run1)

## Vision

A single place to discover everything happening in Gran Canaria. EventosGC automatically aggregates events from Instagram and Slack, normalizes them, and presents them in a clean, browsable interface organized by time (today, tomorrow, this week).

## Problem Statement

Events in Gran Canaria are scattered across Instagram posts, Slack channels, and various websites. There's no single source of truth for what's happening. Locals and visitors waste time checking multiple platforms and still miss things.

## Solution

An event aggregator that:
- **Ingests events** from Instagram (via RapidAPI) and a specific Slack workspace
- **Stores and normalizes** events in Supabase (title, date/time, location, category, source, image)
- **Serves events** through a Next.js frontend already built with category filtering and time-based sections (Today / Tomorrow / This Week)

### Key Features (v1)
- Automated Instagram scraping via RapidAPI (hashtags and/or accounts)
- Slack integration to pull events from community channels
- Supabase-backed event storage and API
- Existing React UI wired to real data
- Category-based event badges (music, arts, food, sports, festival, theater, workshop, market)

### Out of Scope (v1)
- User accounts / authentication
- User-submitted events
- Website scraping (future source)
- Push notifications
- Map view

## Target Audience

- Locals in Las Palmas de Gran Canaria looking for things to do
- Digital nomads and expats in the coworking community
- Tourists visiting Gran Canaria

## Success Criteria

- Events from Instagram appear in the app within a reasonable delay of posting
- Events from Slack appear in the app after being posted in the monitored channel(s)
- The existing UI displays real events from Supabase instead of hardcoded data
- Events are correctly categorized and sorted by date
- The app runs and deploys reliably

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (Postgres + REST API)
- **Data Sources:** RapidAPI (Instagram), Slack API
- **Tooling:** GSD, Ralphy, ESLint, Gitleaks
