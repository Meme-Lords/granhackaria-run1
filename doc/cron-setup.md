# Cron setup (cron-job.org)

We use [cron-job.org](https://cron-job.org) to trigger ingest and mark-gone endpoints because Vercel Hobby only allows daily cron schedules.

## Environment

- Set `CRON_SECRET` in Vercel (Project → Settings → Environment Variables) and use the same value in both cron jobs below.

## Jobs to create

Replace `https://your-app.vercel.app` with your deployed app URL (e.g. `https://granhackaria.vercel.app`).

### 1. Ingest (every 6 hours)

- **URL:** `https://your-app.vercel.app/api/cron/ingest`
- **Method:** GET
- **Schedule:** Every 6 hours (or cron `0 */6 * * *`)
- **Request headers:** Add one header:
  - Name: `Authorization`
  - Value: `Bearer YOUR_CRON_SECRET`

Runs Instagram, Slack, and Meetup ingestion to fetch new events.

### 2. Mark gone (every 10 minutes)

- **URL:** `https://your-app.vercel.app/api/cron/mark-gone`
- **Method:** GET
- **Schedule:** Every 10 minutes (or cron `*/10 * * * *`)
- **Request headers:** Add one header:
  - Name: `Authorization`
  - Value: `Bearer YOUR_CRON_SECRET`

Checks event `source_url` values and sets `source_url_gone = true` when the URL returns 404 or 410 so those events are hidden from the list.
