# Sharing the app with testers

Your app is a **static site** (no server, no database — everything runs in the
visitor's browser). That makes it cheap and easy to put online. Whenever you
change the app, run `npm run build` again to refresh the `dist/` folder, then
re-deploy.

Two ready-to-share files already exist:

- **`dist/`** — the built website (a folder).
- **`cabinet-app.zip`** — the same thing zipped, for drag-and-drop.

---

## ✅ Easiest permanent link — Netlify Drop (no coding, ~2 min)

A real URL anyone can open anytime, even when your computer is off. Free.

1. Go to **https://app.netlify.com/drop** in your browser.
2. Drag the **`dist`** folder (or `cabinet-app.zip`) onto the page.
3. It uploads and gives you a public link like `https://random-name.netlify.app`.
4. (Optional) Create a free account to keep the link, rename it, or replace it later.

**To update it after you change the app:** run `npm run build`, then drag the new
`dist` folder to your site again (or to the Drop page).

Vercel (https://vercel.com), Cloudflare Pages, and GitHub Pages all work the same
way and are also free — Netlify Drop is just the least-clicks option.

---

## ⚡ Instant link from your computer (temporary)

If you want a link *right now* without any signup, I can set up a secure tunnel
(cloudflared or ngrok) that exposes the running app to a public URL. Caveats:

- Your computer and the app must **stay running** for the link to work.
- The link **changes** each time it restarts.
- It exposes a service from your machine, so it needs your explicit go-ahead
  (the sandbox blocks it by default for safety).

Tell me to set this up and I'll walk it through.

---

## Good to know before testers click

- There are **no accounts and no data collection** — each visitor just designs in
  their own browser. Nothing they do is saved or sent anywhere.
- Exports (CSV / JSON / SketchUp) **download to the tester's computer**; they don't
  come back to you.
- **"Request this design"** currently just shows a thank-you message — it does **not**
  email you or capture the lead yet. If you want tester designs/requests sent to you,
  that's a small backend piece we can add (a form service or a tiny serverless
  endpoint) when you're ready.
- The Maker view is visible to anyone with the link. If you don't want testers seeing
  the cost/margin breakdown or exports, say so and I can hide Maker view behind a
  simple passcode for the shared build.
