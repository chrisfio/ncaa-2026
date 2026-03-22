# 2026 March Madness Tracker

A live auction pool tracker for the 2026 NCAA Tournament. Tracks team performance, payouts, and personal share of winnings — auto-updated from ESPN's API.

## How it works

In this auction pool, a group of participants pool money to bid on all 68 NCAA tournament teams. Each team win earns a payout from the total pot. This tracker monitors our team's 7 owned teams and calculates:

- **Team Total view** — overall spend, payout earned, net, and ROI across all 7 teams
- **My Share view** — enter any contribution amount to see your prorated earnings, net, and ROI
- **Live scores** — auto-refreshes every 60 seconds from ESPN, with clock, score, and win/loss coloring for in-progress games
- **Next matchup** — shows opponent and tip-off time for upcoming games

## Teams

| Team | Auction Cost |
|------|-------------|
| Arizona | $26,500 |
| Illinois | $8,300 |
| Gonzaga | $5,500 |
| UCLA | $2,300 |
| Ohio State | $1,300 |
| Texas | $1,100 |
| Long Island | $225 |

**Total spent:** $45,225 · **Total auction pot:** $219,785

## Payout table

| Round | Wins | Payout |
|-------|------|--------|
| Round of 64 | 1 | $1,538 |
| Round of 32 | 2 | $4,176 |
| Sweet 16 | 3 | $10,110 |
| Elite 8 | 4 | $18,242 |
| Final Four | 5 | $30,330 |
| Championship | 6 | $47,913 |

## Stack

- [Next.js 16](https://nextjs.org) — App Router, server components, `use cache`
- [Tailwind CSS](https://tailwindcss.com)
- [ESPN public API](https://site.api.espn.com) — free, no key required
- [Vercel](https://vercel.com) — hosting, auto-deploys from GitHub

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
