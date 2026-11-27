# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/alprasta/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/alprasta/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Giblet's Great Escape — a Thanksgiving turkey runner: Giblet the turkey flees Farmer Bramwell across the farmyard, through the farmhouse kitchen and into the pine forest, jumping fences and hay bales, clearing the hot oven, ducking the carving knife and grabbing corn on the way to 3,000 feet of freedom.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref={referral_code}&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>

## Play it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `game/` with any static HTTP server and open `game/index.html`.
No build step, no libraries, no network requests — all art is drawn in
Canvas 2D and all sound is synthesised in WebAudio.

## How to play

- **Jump / double-flap:** `Space`, `↑`, `W`, or click / tap
- **Dash:** `Shift` or `X` (a short burst of speed; dashing through corn pays extra)
- **Duck:** `↓` or `S` (hold)
- **Pause:** `P` — **Mute:** `M` — **Restart:** `R`
- **Start:** `Enter` or click

The run, in three stages:

1. **The farmyard (0–1,100 ft)** — jump fences, hay bales and pumpkin
   piles; grab corn for points and golden feathers for a speed boost.
2. **The farmhouse kitchen (1,100–2,200 ft)** — the oven's flame jets
   burst from its door, so leap the whole oven in one jump; the carving
   knife drops from above and sticks in the floorboards — leap it. Mind
   the copper pots.
3. **The pine forest (2,200–3,000 ft)** — logs and brambles at full
   speed. Reach 3,000 ft and Thanksgiving is cancelled.

Farmer Bramwell chases from behind the whole way: every stumble lets
him close in, and if his pressure meter fills, he grabs you. Three
hearts, one turkey, no second helpings.
