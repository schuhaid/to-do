# Ticked: a small, private to-do list

A to-do app for a small group. Everyone signs up with email and password and gets their own private list. Nobody can see anyone else's tasks.

Built with **Next.js 16** (App Router, TypeScript), **Supabase** (Postgres + Auth), **@supabase/ssr** and **Tailwind CSS v4**.

## Features

- Sign up, log in, log out (email + password)
- Add, edit, check off and delete tasks
- Filter by all / open / done
- Private by design: Row Level Security in the database makes sure each user only ever sees their own rows

## Project structure

```
app/
  (auth)/login, (auth)/signup   login and signup pages
  (auth)/actions.ts             login / signup / logout server actions
  auth/confirm/route.ts         landing page for email confirmation links
  todos/page.tsx                the to-do list (server component)
  todos/actions.ts              add / rename / check off / delete server actions
components/                     AuthForm, AddTodo, FilterTabs, TodoItem, Wordmark
lib/supabase/
  client.ts                     Supabase client for the browser
  server.ts                     Supabase client for server components and actions
  proxy.ts                      session refresh and route protection
proxy.ts                        Next.js proxy (called "middleware" before Next 16)
supabase/schema.sql             table + RLS policies; run this in Supabase
```

---

## 1. Supabase setup (free plan)

1. Go to [supabase.com](https://supabase.com), click **Start your project** and sign up (GitHub or email). New accounts are on the free plan.
2. Click **New project**. Pick a name (e.g. `todo-app`), set a database password (save it somewhere safe), choose a region near you (e.g. *Central EU (Frankfurt)*) and click **Create new project**. Setup takes about 2 minutes.
3. **Create the table.** In the left sidebar, open **SQL Editor** and click **New query**. Paste the whole contents of `supabase/schema.sql` and click **Run**. You should see *"Success. No rows returned"*. You can check the result under **Table Editor → todos**, where the table shows an "RLS enabled" badge.
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

## Known limitations

- No password reset, social login, sharing or teams (left out on purpose).
- With "Confirm email" on, Supabase's default email sender has a low hourly limit. For more emails, add your own SMTP provider under **Authentication → Emails → SMTP settings**.
- No ordering by drag and drop. Open tasks come first, newest at the top.
