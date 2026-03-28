# LibraryMS — Setup Guide

A complete library management system built with plain HTML/CSS/JS + Supabase.

---

## Quick Start (5 steps)

### 1. Create a Supabase project
- Go to https://supabase.com → New Project
- Choose a name and region, set a database password

### 2. Set up the database
- In your Supabase dashboard → **SQL Editor** → **New Query**
- Paste the contents of `setup.sql` and click **Run**
- This creates the `profiles`, `books`, and `lendings` tables + sample data

### 3. Get your API keys
- Supabase dashboard → **Settings** → **API**
- Copy: **Project URL** and **anon/public** key

### 4. Configure the app
- Open `js/config.js`
- Replace `YOUR_SUPABASE_PROJECT_URL` with your Project URL
- Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

### 5. Open the app
- Open `index.html` in your browser (or serve with VS Code Live Server)
- Register your first admin account
- Start managing your library!

---

## Project Structure

```
library-bms/
├── index.html        Login / Signup
├── dashboard.html    Admin Dashboard — stats, books CRUD, members
├── lending.html      Issue books — 3-step member → book → confirm flow
├── search.html       Browse catalog — grid/list view, filters, book detail
├── returning.html    Process returns — fine calculation, history
├── css/
│   └── style.css     Complete design system (shared by all pages)
├── js/
│   ├── config.js     ← EDIT THIS: your Supabase URL + key
│   └── app.js        Auth guard, sidebar, shared utilities
└── setup.sql         Database schema + seed data
```

---

## Features

| Page | Features |
|---|---|
| Login/Signup | Email auth, role selection (admin/member), forgot password |
| Dashboard | Stats cards, books CRUD, member list, recent lendings |
| Lend a Book | Member search, available book search, due date, instant issue |
| Browse Books | Grid/list toggle, search, genre + availability filters, detail panel |
| Return a Book | Active lending list, overdue detection, fine calc (₹5/day), history |

---

## Fine Calculation
Overdue fine = **₹5 per day** past the due date.
To change the rate, edit this line in `js/app.js`:
```js
function calcFine(dueDateStr) {
  return daysOverdue(dueDateStr) * 5; // change 5 to your rate
}
```

---

## Deployment
Any static host works: **Netlify**, **Vercel**, **GitHub Pages**, or your own server.
Just upload all files — no build step needed.
