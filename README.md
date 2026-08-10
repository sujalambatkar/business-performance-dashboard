# Business Performance Dashboard

A small internal tool for uploading CSV exports and viewing key business
metrics, trends, and rule-based insights. Built with Next.js 14 (App Router),
Tailwind CSS, PapaParse, and Recharts. No backend, no database — everything
runs client-side in the browser.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login`.

### Login credentials

Credentials are read from environment variables (not hardcoded in the repo).
A `.env.local` file is used locally — copy the example file to get started:

```bash
cp .env.local.example .env.local
```

Default values in `.env.local.example`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Change these to whatever you like. `.env.local` is gitignored and never
committed.

## CSV format

The uploader expects a CSV with these columns (header names are matched
case-insensitively, and spaces/dashes/underscores are treated the same, so
`Website Visits`, `website_visits`, and `WEBSITE-VISITS` all work):

| Column           | Type   | Description                        |
| ---------------- | ------ | ----------------------------------- |
| `date`           | text   | Any date string, e.g. `2026-07-01`  |
| `leads`          | number | Leads generated that day            |
| `calls`          | number | Calls made that day                 |
| `website_visits` | number | Website visits that day             |
| `revenue`        | number | Revenue generated that day          |

Example:

```csv
date,leads,calls,website_visits,revenue
2026-07-01,12,20,600,2400
2026-07-02,15,18,720,3100
```

Click **Download Sample CSV** on the dashboard to get a ready-to-use file.

You can upload a **Current Period** CSV on its own, or also upload a
**Previous Period** CSV to see side-by-side comparisons and % change
indicators.

### Metrics shown

- **Total Leads** — sum of `leads`
- **Total Calls** — sum of `calls`
- **Website Visits** — sum of `website_visits`
- **Revenue** — sum of `revenue`
- **Conversion Rate** — `(Total Leads / Total Website Visits) × 100`

### Error handling

- Non-`.csv` files are rejected with a message.
- Empty files are rejected with a message.
- Missing required columns are listed by name.
- Rows with missing or non-numeric values are skipped, and a count of
  skipped rows is shown (the rest of the file still loads).
- Parsing is wrapped in try/catch so a bad file never produces a blank
  screen — you'll always see an inline error instead.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign up/log in with your GitHub
   account.
3. Click **Add New → Project**, and import this GitHub repository.
4. In the **Environment Variables** section of the import screen, add:
   - `ADMIN_USERNAME` = your chosen username
   - `ADMIN_PASSWORD` = your chosen password
5. Click **Deploy**. Vercel will build and host the app automatically —
   no other configuration is needed since there's no database or backend.
6. Once deployed, visit your Vercel URL, which will redirect you to
   `/login`.

Any time you push to the connected branch, Vercel redeploys automatically.
