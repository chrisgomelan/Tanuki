# Tanuki (狸)

A sleek, free movie streaming and tracking web application, built with **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS v4**.

Part of the mythical streaming trio:
- **Kitsune** (狐) — Anime
- **Gumiho** (구미호) — K-Dramas & Western TV Series
- **Tanuki** (狸) — Feature Films & Blockbuster Movies

## Features

- **Movies Only**: 100% focused on full-length feature films across all genres.
- **Zero Database / Zero Accounts Required**: Client-side savepoints via `localStorage` with cross-tab sync.
- **Multiple Free Video Streaming Servers**: High-availability embed player featuring multi-server fallback:
  - VidLink (HD Movie)
  - VidSrc Me (HD)
  - AutoEmbed (Multi-Source)
  - VidSrc CC (Sub & Dub)
  - MultiEmbed Stream
  - Embed.su (Fast)
  - Videasy Player
  - 2Embed Player
  - SmashyStream
- **Playback Timestamp Bookmarks**: Bookmark paused movie timestamps and resume with one click.
- **Instant AJAX Live Search**: Debounced search bar with poster previews, release year, runtime, and ratings.
- **Interactive Genre Pills**: Browse by Action, Sci-Fi, Adventure, Animation, Comedy, Drama, Horror, Romance, Thriller, Crime, and Mystery.
- **Zero Emojis**: Lightweight, zero-dependency inline SVG icon library (`components/Icons.tsx`).
- **Warm Amber Aesthetic**: Distinctive golden-amber dark mode theme matching the Tanuki raccoon dog spirit.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
