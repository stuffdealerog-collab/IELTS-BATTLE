# Deploy IELTS Battle to Vercel

## 1. Create a Postgres database (Neon — free)

1. Go to https://neon.tech and sign up (GitHub login works)
2. Create a new project (region: **Europe** for lowest latency to RU/CIS)
3. From the dashboard, copy the **Pooled connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Push the code to a GitHub repo

Vercel needs a GitHub repo to import. If you don't have one yet:

```bash
# Create new repo at https://github.com/new (name it ielts-battle)
git remote add github https://github.com/<your-username>/ielts-battle.git
git push -u github claude/ielts-writing-platform-kCeVJ:main
```

## 3. Import the repo into Vercel

1. Go to https://vercel.com/new
2. Import your `ielts-battle` repo
3. Framework: Next.js (auto-detected)
4. **Before clicking Deploy** — open "Environment Variables" and paste all of these:

| Key | Value |
|---|---|
| `DATABASE_URL` | (paste from Neon) |
| `ANTHROPIC_API_KEY` | your Claude key |
| `TELEGRAM_BOT_TOKEN` | `7801008447:AAFDcgwluk-rZagGTD-X4mE-Q2LuHk_WLg0` |
| `JWT_SECRET` | (any random 32+ char string) |
| `PUSHER_APP_ID` | `2154776` |
| `PUSHER_KEY` | `fdaf6f59c8cf1a33bd43` |
| `PUSHER_SECRET` | `58fa5eeede84d378c598` |
| `PUSHER_CLUSTER` | `eu` |
| `NEXT_PUBLIC_PUSHER_KEY` | `fdaf6f59c8cf1a33bd43` |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | `eu` |

5. Click **Deploy** — it will:
   - Run `prisma generate` (postinstall)
   - Run `prisma migrate deploy` (creates all tables in Neon)
   - Build Next.js
   - Deploy

6. After deploy, copy the URL (e.g. `https://ielts-battle.vercel.app`)

## 4. Seed the database

After first deploy, run the seed once locally pointing at production DB:

```bash
DATABASE_URL="<your neon url>" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

This loads 80 IELTS topics + 4 AI tutor lessons into the DB.

## 5. Attach the Mini App to your bot

In Telegram, open [@BotFather](https://t.me/BotFather):

```
/newapp
→ select @ieltsbattle_bot
→ Title: IELTS Battle
→ Description: Compete in IELTS Writing battles with AI judges
→ Photo: upload a 640×360 image (any)
→ GIF: skip (/empty)
→ Web App URL: https://ielts-battle.vercel.app
→ Short Name: play
```

Done. Your app is live at: `https://t.me/ieltsbattle_bot/play`

## 6. Test it

1. Open the link above in Telegram (mobile app)
2. You should see the main menu (Solo / Battle / Practice)
3. Solo: pick a lesson → chat with AI tutor
4. Battle: pick mode → find opponent (open on a second device or share with a friend)

## Troubleshooting

- **"Open in Telegram" screen**: you opened the URL in a browser, not via the bot. Use `t.me/ieltsbattle_bot/play`.
- **Battles don't sync**: check Pusher credentials and that NEXT_PUBLIC_PUSHER_* env vars are set.
- **AI feedback fails**: check ANTHROPIC_API_KEY in Vercel env vars. Redeploy after adding/changing env vars.
- **Migration fails on deploy**: ensure DATABASE_URL is the *pooled* Neon connection string, with `?sslmode=require`.
