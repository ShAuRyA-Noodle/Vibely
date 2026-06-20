# Vibely

Vibely is a proof-of-work social network for builders. It is the place where engineers, designers, and founders let their shipped work speak louder than their resume. Profiles are rich, the feed is fast, and the whole thing is built on a modern, type-safe Next.js stack.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, React 19)
- **Language:** TypeScript
- **Auth:** Clerk v7
- **Database:** MongoDB with Mongoose
- **Media:** Cloudinary (signed direct uploads)
- **UI:** Tailwind CSS, Radix UI primitives, Framer Motion, Geist, lucide-react
- **Notifications:** react-toastify and Sonner

## Features

- **Auth and onboarding.** Clerk sign-up and sign-in, with an onboarding wizard that creates a persistent Vibely profile.
- **Rich profiles.** Editable profiles with experience, education, and skills, plus subscriber, subscribing, and post counts.
- **Subscriptions.** A one-way subscribe and unsubscribe relationship model, with suggested profiles backed by MongoDB.
- **Feed.** Text, image, and video posts with likes, reactions, threaded comments, quote reposts, plain repost toggles, polls, and author-only deletes.
- **Direct messaging.** One-to-one conversations with a threaded message view.
- **Search.** Search across people, posts, and hashtags.
- **Notifications.** In-app notifications with an unread-count badge.
- **Analytics.** Impression tracking and a per-account analytics view.
- **Moderation.** Reporting, a lexicon-based content guard, and strike handling.
- **Uploads.** Signed Cloudinary direct uploads for post media.

## Architecture Notes

- Data access runs through Next.js Server Actions in `lib/actions`, with Mongoose models in `models`.
- Routes are protected by Clerk middleware in `middleware.ts`.
- A cursor-based feed API lives at `app/api/feed`, and upload signing lives at `app/api/uploads/signature`.
- Legacy demo posts are hidden behind `schemaVersion: 2`.

## Run Locally

Install dependencies:

```bash
npm install
```

> This project relies on a few packages whose peer ranges predate React 19. If install complains about peer dependencies, run `npm install --legacy-peer-deps`.

Create a `.env.local` file in the project root:

```bash
MONGO_URI=YOUR_MONGO_URL
CLOUD_NAME=YOUR_CLOUDINARY_NAME
API_KEY=YOUR_CLOUDINARY_API_KEY
API_SECRET=YOUR_CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Security

Security policy and reporting are documented in [SECURITY.md](./SECURITY.md). Dependabot, CodeQL, and secret scanning are enabled on this repository.
