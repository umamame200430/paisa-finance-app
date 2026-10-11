# paisa. — Your 30-Day Money Challenge

A responsive React + Vite personal-finance simulator for a hackathon demo.

## Requirements
- Node.js 20.19+ (recommended) or a current supported Node release
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Features
- ₹10,000 sample budget, current day selector, cash remaining, flexible balance and daily allowance
- What-if purchase simulator that updates budget figures when recorded
- Editable sample transactions: add and delete expenses
- Savings goals and contributions
- Commitments and togglable subscriptions
- Risk indicator and illustrative financial-health score
- Forecast chart with planned and cautious spending paths
- Local browser persistence using localStorage
- Export current demo state as JSON
- Responsive layout, keyboard focus styles, accessible labels, reduced-motion support

## Notes
- All data is illustrative and stored in the current browser on the current device.
- This is not a banking app, does not connect to financial institutions, and does not make real payments or cancel subscriptions.
- Financial health score and forecasts are demo heuristics, not financial advice or a credit score.
- Google Fonts is an optional remote font import; the app uses fallback fonts if unavailable.
