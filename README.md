# Setup Guide

This page fetches your real channel name, description, photo, and member
count directly from Telegram, and stores visit/click counts using Netlify's
own storage. Follow these steps in order.

## Step 1 — Create a Telegram bot

1. Open Telegram, search for **@BotFather**, start a chat.
2. Send `/newbot`, give it a name and a username (must end in `bot`).
3. BotFather replies with a **bot token** — looks like `123456789:AAExample-Token`.
   Copy it somewhere safe. You'll paste it into Netlify in Step 4 (not into any file).

## Step 2 — Add the bot as admin of your channel

1. Open your channel → **Manage Channel** → **Administrators** → **Add Admin**.
2. Search for your bot's username and add it.
3. Any admin permissions are fine — it only needs read access to fetch info.

## Step 3 — Get your channel's numeric chat ID

Private invite-link channels (`t.me/+hash`) don't have a public `@username`,
so the bot needs a numeric ID instead:

1. Post any message in your channel (or forward one to the bot).
2. In your browser, visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   (replace `<YOUR_TOKEN>` with your real token)
3. Look for `"chat":{"id":-1001234567890, ...}` in the response — that
   negative number is your `TG_CHAT_ID`.

## Step 4 — Deploy this project to Netlify via Git

Functions need a build step, so this time it's a Git-based deploy instead
of drag-and-drop:

1. Create a new GitHub repo and push this whole folder to it.
2. In Netlify: **Add new site → Import an existing project → connect the repo**.
3. Build settings: publish directory `.`, no build command needed
   (Netlify auto-installs `package.json` dependencies for you).
4. Go to **Site settings → Environment variables** and add:
   - `TG_BOT_TOKEN` = your bot token from Step 1
   - `TG_CHAT_ID` = your numeric chat ID from Step 3
5. Deploy. Netlify Blobs works automatically — no extra setup needed for
   the counters.

## Step 5 — Test it

Open your live Netlify URL. You should see:
- Your real channel photo, name, description, and member count
- Visit count going up on every page load
- Click count going up when the button is pressed or auto-redirect fires

If the photo/name don't appear, double check the bot is an admin and that
`TG_CHAT_ID` is the exact negative number from `getUpdates`.

## Editing channel link / redirect timing

Open `index.html` and edit the constants near the top of the `<script>` tag:
- `TELEGRAM_LINK` — your invite link
- `REDIRECT_SECONDS` — countdown length
- `CHANNEL_NAME_FALLBACK` / `CHANNEL_DESC_FALLBACK` — used only if the
  Telegram API call fails for some reason
