# Voca

Daily technical English for software engineers. Each morning is five B2/C1 terms: up to two due for review, the rest new. Explain them by voice or text. Whisper transcribes mixed Hebrew and English. GPT-4o mini marks each term mastered, partial, or missed, then writes a definition, a mnemonic hook, and a system scenario.

## Setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/migrations/20261019120000_lexipulse_init.sql`](supabase/migrations/20261019120000_lexipulse_init.sql). The script is safe to run more than once.
3. In Authentication, enable email and password. For local development, disable “Confirm email”.
4. Copy [`.env.example`](.env.example) to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

5. Install and start:

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without credentials, the login screen links to a local preview at `/demo`. The preview stores progress in this browser and scores with a local checker. Signed-in sessions use Supabase, Whisper, and GPT-4o mini.

## Practice loop

- `POST /api/session/daily` returns today’s five terms, creating them once per local date.
- `POST /api/session/transcribe` sends a `webm` or `mp4` recording to `whisper-1`.
- `POST /api/session/evaluate` grades the transcript plus per-term notes and updates the SM-2 schedule.

A mastered term moves through intervals of 1 day, 3 days, then `round(interval × ease)`. The fourth success marks it mastered. A partial or missed answer comes back tomorrow.
