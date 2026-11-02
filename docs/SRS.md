# Software Requirement Specification (SRS): Football Bidding Web Game

## 1. Project Overview
A web-based multi-player football player bidding game for exactly 4 players per room. 
The host controls the game state (bidding, manual/auto player generation, point distribution), while 3 other players join via Room ID to view real-time updates (formations, bank points, current bid, player points).

---

## 2. Core Game Rules & Mechanics

### 2.1 Players & Bank Points
- **Room Capacity:** Exactly 4 participants per room (1 Host + 3 Players, or Host acting as Player 1 + 3 Players).
- **Starting Bank:** Each participant starts with **100 Bank Points**.
- **Player Value (1–4 Points):** Each revealed footballer carries a hidden/shown point value (1 to 4 pts) that contributes to the user's final team score.

### 2.2 Blind Reveal Bidding Flow
1. **Blind Reveal:** Host reveals footballers sequentially (e.g., reveals Chmakh [1 pt GK], then Raya [4 pt GK]).
2. **Auction Process:** Participants bid real-life/verbal bank points.
3. **Host Assignment:** Host selects the winning participant, enters the winning bid (cost), and assigns the footballer to that participant's roster.
   - A winning bid is a whole number of **at least 1 bank point**: nobody signs a footballer for free, and only participants with bank points left can be selected.
4. **Automatic Deduction:** 
   `Participant Bank Points = Current Bank Points - Winning Bid Cost`
5. **Score Aggregation:** 
   `Participant Score = Sum of all acquired footballers' point values (1-4 pts)`

### 2.3 Pool Size Calculation Logic
- Every room must pick a target formation (e.g., `4-4-2`, `4-3-3`, `3-5-2`).
- The player pool generated for each position **MUST** equal `(Required Position Count in Formation) × 4`.
  - *Example:* If formation requires 3 Defenders, total Defenders in bidding pool = `3 × 4 = 12 Defenders`. This guarantees all 4 participants can complete their exact formation.

---

## 3. Game Modes

### Mode A: Offline Host Controller (Phone / Single Screen)
- Host operates the entire interface on one device.
- Updates bank points, formations, and bids manually while announcing results verbally to offline participants.

### Mode B: Multiplayer Lobby (Room ID / Real-Time Dashboard)
- Host creates a room and shares a **Lobby ID / Password**.
- Participants connect on their own mobile or desktop browsers.
- **Participant View (Read-Only/Interactive Display):**
  - Live formation grid (filled vs. empty slots).
  - Total bank points remaining for all 4 players.
  - Current footballer up for auction.
  - Final winner reveal screen when bidding ends.

---

## 4. Tech Stack Specification

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + UI Library (shadcn/ui or DaisyUI)
- **Real-Time Data:** Supabase (Database + Realtime channels)
- **Deployment:** Vercel

---

## 5. Database Schema & Data Models

### `players` (Pre-seeded / Custom JSON)
```json
[
  {
    "id": "p1",
    "name": "Chmakh",
    "position": "GK",
    "pts": 1,
    "nationality": "Tunisia",
    "image_url": "/players/chmakh.png"
  },
  {
    "id": "p2",
    "name": "David Raya",
    "position": "GK",
    "pts": 4,
    "nationality": "Spain",
    "image_url": "/players/raya.png"
  }
]