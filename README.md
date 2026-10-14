# Ticked: a small, private to-do list

A to-do app for a small group. Everyone signs up with email and password and gets their own private list. Nobody can see anyone else's tasks.

Built with **Next.js 16** (App Router, TypeScript), **Supabase** (Postgres + Auth), **@supabase/ssr** and **Tailwind CSS v4**.

## Features

- Sign up, log in, log out (email + password)
- Tasks: add, rename, check off, delete; filter by all / open / done
- **Subtasks** on every task: add, rename, check off, delete, reorder (↑ ↓). The task shows its progress ("3/5 done")
- **Notes** on subtasks: free text with Markdown, hidden until you expand the subtask
- **Due dates** on tasks and subtasks. Overdue items turn red, items due today amber, items due in the next 3 days green
- **Priorities** (none / low / medium / high) and **tags** (type `#school` straight into the new-task field)
- **Search** across tasks, subtasks and tags; filter by due date and tag; sort smart / by due date / by priority / newest
- **Dashboard**: open vs done, completed in the last 30 days, upcoming deadlines, progress per task
- **Graph**: an Obsidian-style map of all tasks, subtasks and tags. Node size shows weight (switch between priority, urgency and workload), color shows status, a ring shows subtask progress, the heaviest tasks glow, and overdue links pulse. Hover a node to focus its neighbors; click to open it
- **Feedback button** (sidebar above Shortcuts; top bar on phones): testers write a subject + message and it's emailed to you
- **Keyboard shortcuts**: `n` new task, `/` search, `1` `2` `3` switch views, `?` show all, `⌘Z` / `Ctrl+Z` undo a delete
- **Swipe** (touch screens): swipe a task or subtask right to tick it off, left to delete it
- **Undo** instead of "Are you sure?": deleting shows an Undo toast for 5 seconds before anything is removed
- Private by design: Row Level Security makes sure each user only ever sees their own rows

## Using the views

| View | URL | What it's for |
| --- | --- | --- |
| Tasks | `/todos` | Everyday use. Click a task's title to open it; double-click to rename it in place |
| Task | `/todos/<id>` | Due date, priority, tags, and the subtasks with their notes |
| Dashboard | `/dashboard` | What's left and what's coming up. Tiles link to the matching filtered list |
| Graph | `/graph` | The big picture. "Size by" switches what node size means; toggle subtasks, tags and done items; "Fit to screen" recenters. On phones subtasks start hidden |

## Project structure

```
app/
  (auth)/login, (auth)/signup     login and signup pages
  (auth)/actions.ts               login / signup / logout
  todos/page.tsx                  list view
  todos/[id]/page.tsx             task page with subtasks
  todos/actions.ts                all task + subtask server actions
  dashboard/page.tsx              dashboard
  graph/page.tsx                  graph view
  */layout.tsx                    each uses components/AppShell (header, tabs, shortcuts)
  auth/confirm/route.ts           email confirmation links
components/
  task/                           task header, meta editor, subtasks, notes
  dashboard/                      Recharts charts
  graph/                          react-force-graph canvas
lib/
  data.ts                         every database read (server only)
  list-query.ts                   list search / filter / sort
  stats.ts, graph.ts              data for the dashboard and graph
  dates.ts                        "today", due-date status and formatting
  supabase/                       Supabase clients + session proxy
supabase/
  schema.sql                      base table + RLS (run first)
  migrations/002_features.sql     subtasks, notes, due dates, priorities, tags (run second)
```

---

## 1. Supabase setup (free plan)

1. Go to [supabase.com](https://supabase.com), click **Start your project** and sign up (GitHub or email). New accounts are on the free plan.
2. Click **New project**. Pick a name (e.g. `todo-app`), set a database password (save it somewhere safe), choose a region near you (e.g. *Central EU (Frankfurt)*) and click **Create new project**. Setup takes about 2 minutes.
3. **Create the tables.** In the left sidebar, open **SQL Editor** and click **New query**. Paste the whole contents of `supabase/schema.sql` and click **Run**. You should see *"Success. No rows returned"*. Then do the same with `supabase/migrations/002_features.sql`. Check the result under **Table Editor**: `todos` and `subtasks` both show an "RLS enabled" badge.

   **Upgrading an existing install?** Only run `002_features.sql`. It only adds columns and a table; existing tasks keep all their data, and it's safe to run twice. Run it **before** deploying the new code, otherwise the live app will error until you do.
4. **Email confirmation.** Go to **Authentication → Sign In / Providers → Email** and find **Confirm email**.
   - **Recommended for this app: off.** Supabase's built-in email service on the free plan only sends a handful of emails per hour, which a group signing up at once will hit. With confirmation off, people are logged in right after signing up.
   - If you leave it **on**, the app still works: users get a "Check your inbox" message, and the link brings them back via `/auth/confirm`. In that case, set the URLs in step 3 of the Vercel section.

## 2. Local setup

Requirements: Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local      # on Windows: copy .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → **Connect** (top bar), or **Project Settings → Data API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings → API Keys** → the `anon` `public` key (on newer projects this may be called the *publishable* key, which also works) |

> Never use the `service_role` / secret key in this app. It bypasses Row Level Security. The app only needs the public key, which is safe in the browser because RLS protects the data.

Then:

```bash
npm run dev
```

Open <http://localhost:3000>, create an account and add a task.

Other scripts: `npm run build` (production build), `npm start` (run the build), `npm run lint`.

## 3. Deploy to Vercel

1. **Push the code to GitHub.** Create an empty repository on GitHub, then in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
   `.env.local` is in `.gitignore`, so your keys stay out of GitHub.
2. **Import into Vercel.** Go to [vercel.com](https://vercel.com), sign up with GitHub (the free *Hobby* plan is enough), click **Add New → Project**, and import the repository. The framework is detected as Next.js automatically.
3. **Add the environment variables.** Before clicking Deploy, open **Environment Variables** and add both:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Use the same values as in `.env.local`. Click **Deploy**. If you add or change variables later, redeploy (**Deployments → ⋯ → Redeploy**), because `NEXT_PUBLIC_` values are baked in at build time.
4. **Tell Supabase your live URL.** In Supabase, go to **Authentication → URL Configuration**:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** add `https://your-app.vercel.app/**` and `http://localhost:3000/**`

   This matters when "Confirm email" is on. Confirmation links only redirect to URLs on this list.
5. Open your Vercel URL, sign up and you're live.

## Free plan: projects pause after a week of inactivity

Free Supabase projects are **paused automatically after 7 days without activity**. A paused project makes the app show "Couldn't load your tasks" and logins fail. Your data is kept.

**To restore it:** log in to [supabase.com/dashboard](https://supabase.com/dashboard), open the project and click **Restore project**. It's back within a few minutes, and you don't need to change anything in the app or on Vercel. Paused projects can only be restored from the dashboard for a limited time (currently 90 days), so don't leave one paused for months. Regular use of the app keeps the project awake.

## How privacy is enforced

- `todos.user_id` defaults to `auth.uid()` and references `auth.users`.
- Row Level Security is enabled, with separate `select` / `insert` / `update` / `delete` policies that all require `auth.uid() = user_id`.
- The `anon` role has no access to the table at all, so logged-out requests get nothing.
- Server actions check the logged-in user again before every change, and they also filter by `user_id`.

## Feedback emails (Resend)

The **Feedback** button emails messages to you through [Resend](https://resend.com) (free: 3,000 emails/month).

1. Sign up at resend.com **with the email address that should receive the feedback**.
2. Go to **API Keys → Create API Key** (permission: *Sending access*) and copy the key (`re_…`).
3. Add two environment variables, in `.env.local` for local use and in **Vercel → Project → Settings → Environment Variables**:
   - `RESEND_API_KEY` = the key
   - `FEEDBACK_TO_EMAIL` = the email you signed up with
4. Redeploy on Vercel (Deployments → ⋯ → Redeploy).

Without your own domain, Resend sends from `onboarding@resend.dev` and only delivers to your own account email, which is exactly what feedback needs. The tester's email is set as *Reply-To*, so you can answer directly. Until the variables are set, the dialog says feedback isn't set up yet.

## Timezone

"Today", "overdue" and "due soon" are calculated in `Europe/Vienna`, so the server and the browser always agree. To change it, set `NEXT_PUBLIC_APP_TIMEZONE` (e.g. `Europe/Berlin`) in `.env.local` and in Vercel.

## Ideas for later

- **Recurring tasks** (every Monday, monthly): very useful, but needs scheduling logic
- **Drag & drop** to reorder tasks and subtasks
- **Manual light/dark toggle**: the app already follows your system setting

## Known limitations

- No password reset, social login, sharing or teams (left out on purpose).
- With "Confirm email" on, Supabase's default email sender has a low hourly limit. For more emails, add your own SMTP provider under **Authentication → Emails → SMTP settings**.
- Subtasks are reordered with ↑ ↓ buttons, not drag and drop.
- The graph draws on a canvas, so it is mouse/touch only. Every task is also reachable from the list.
