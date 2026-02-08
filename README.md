# CleanPulse

CleanPulse = Verified Waste Reports + Fast Resolution Tracking (SDG 11.6, optional 11.2).

## Quick start

```bash
pnpm install
pnpm dev
# app runs on http://localhost:3000
```

## Tech
- Next.js 14 App Router + TypeScript
- Firebase Auth + Firestore
- Tailwind CSS
- S3 uploads with presigned PUT
- Gemini API for summaries + recommended actions
- Open-Meteo Air Quality API (no key)

## Environment
Copy `.env.example` to `.env.local` and fill values.

## Firebase setup
1. Create a Firebase project and enable Email/Password auth.
2. Create Firestore in production mode, then paste `firestore.rules` into Rules tab and publish.
3. Add a web app in Firebase console and fill the NEXT_PUBLIC_* keys.
4. First admin: sign up via the app, then in Firestore set `users/{uid}.role = "admin"` for your uid.

## S3 setup (Option A: public-read bucket for speed)
- Create bucket, enable ACLs.
- CORS example:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```
- Bucket policy (public read):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::clearpulse-public/*"
    }
  ]
}
```
- Set `S3_PUBLIC_BASE_URL=https://clearpulse-public.s3.amazonaws.com`.

## Commands
- `pnpm dev` — run locally
- `pnpm build` — production build
- `pnpm start` — serve build

## Pages
- `/` map of issues with filters.
- `/report` submit new issue (requires login).
- `/issue/[id]` details, air quality context, verification buttons.
- `/admin` admin dashboard with status updates, AI actions, demo data seeding.

## Impact features
- Duplicate detection: geohash + 80m radius check + 48h window.
- Verification buttons: stored per user in subcollection, updates counts, refreshes priority.
- Priority score formula documented in `lib/util.ts`.
- Status timeline persisted on every admin change.
