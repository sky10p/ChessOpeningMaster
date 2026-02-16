# Game Imports and Training Plan Guide

## Overview
The application now includes a unified game ingestion flow for Lichess, Chess.com, and manual PGN imports.

## Where to find it
- Open **My Games** from the sidebar.
- Route: `/games`.

## Linked Accounts
- Choose provider (`lichess` or `chesscom`).
- Enter username and optional token.
- Click **Connect**.
- Use **Sync** to import new games since last sync.
- Use **Disconnect** to remove provider link.

## Manual PGN Import
- Paste PGN directly into the textarea.
- Or upload a `.pgn` file to preload the textarea.
- Optional fields:
  - Tournament/Training group
  - Tags (comma-separated)
- Click **Import PGN**.

## Opening Classification and Mapping
- Import pipeline reads ECO/Openings tags when available.
- Otherwise it builds a line signature from the first 12 plies.
- Detected lines are mapped to Saved Openings repertoires using confidence-based heuristics.

## Statistics and Lines to Study
- The My Games page shows total game count and W/D/L summary.
- Lines to study are calculated from underperformance, frequency, recency, and deviation indicators.

## Training Plan
- Click **Regenerate Training Plan** to build a prioritized queue.
- Mark items as done directly in the list.
- Priorities use configurable weighted scoring under the hood.

## Security
- Linked provider tokens are encrypted at rest.
- Requests remain cookie-authenticated and user-scoped.
