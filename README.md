# 🍫 ChocoHunt — Premium Chocolate Brand Website
**Managed & Designed by LeadKnight**

---

## 📁 Project Structure

```
chocohunt-website/
│
├── home.html           ← Homepage (Hero, Collections, About, Testimonials)
├── collection.html     ← Full Collections with filter tabs
├── about.html          ← Brand story, timeline, values, awards
├── partners.html       ← Retail partners, partnership types, apply form
├── reviews.html        ← Customer reviews, ratings, write-a-review
├── contacts.html       ← Contact form, map, social, FAQ
│
├── assets/
│   ├── css/
│   │   └── style.css   ← All shared styles (dark/light mode, all components)
│   └── js/
│       └── main.js     ← All shared JS (auth, theme, animations, API calls)
│
├── backend/
│   └── server.js       ← Node.js Express backend
│
├── package.json        ← NPM dependencies
└── README.md           ← This file
```

---

## 🚀 Quick Start

### 1. Open Without Backend (Static Mode)
Just double-click `home.html` in your browser — all pages, animations, theme toggle, and UI work without the backend.

---

### 2. Run With Backend (Full Features)

**Prerequisites:** Node.js 16+ installed on your machine.

```bash
# Step 1 — Install dependencies
cd chocohunt-website
npm install

# Step 2 — Start the backend server
npm start

# For development (auto-reload)
npm run dev
```

The server starts at: **http://localhost:3001**

Open your browser at: **http://localhost:3001/home.html**

---

## ⚙️ Backend API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Create new account | — |
| POST | `/api/auth/login` | Login, returns JWT | — |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/contact` | Submit contact form | — |
| GET | `/api/contact` | Get all contacts | Admin |
| POST | `/api/reviews` | Submit review | — |
| GET | `/api/reviews` | Get approved reviews | — |
| PATCH | `/api/reviews/:id/approve` | Approve a review | Admin |
| POST | `/api/newsletter` | Subscribe to newsletter | — |
| POST | `/api/partner` | Partnership enquiry | — |
| GET | `/api/admin/stats` | Dashboard stats | Admin |
| GET | `/api/admin/users` | All users | Admin |
| GET | `/api/health` | Health check | — |

---

## 🌙 Dark / Light Mode

- Toggle button in the navbar on every page
- Preference is saved in `localStorage` and persists across sessions
- All pages apply theme before paint (no flash)

---

## 🔐 Login / Register

- Auth modal appears on every page via the navbar
- JWT stored in `localStorage`
- Session persists on page reload
- Logout clears token and updates navbar

**To create an admin account:**
After registering, open `backend/db.json` and change the user's `"role"` from `"customer"` to `"admin"`.

---

## 📧 Email Configuration

To enable real email sending, set these environment variables before starting:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
JWT_SECRET=your_custom_secret
```

Or create a `.env` file (install `dotenv` and add `require('dotenv').config()` at the top of `server.js`).

---

## 🗄️ Database

This project uses a simple **JSON file database** (`backend/db.json`) — no MongoDB or SQL setup required. Perfect for development and small production deployments.

For production at scale, swap the `loadDB/saveDB` functions for MongoDB / Prisma / Supabase.

---

## 🎨 Design System

| Variable | Dark Mode | Light Mode |
|----------|-----------|------------|
| `--bg-primary` | `#0d0704` | `#fdf6ed` |
| `--bg-secondary` | `#1a0a00` | `#f5e6d3` |
| `--text-primary` | `#f5ede0` | `#1a0a00` |
| `--gold` | `#c8962c` | `#a0720e` |
| `--gold-light` | `#e6b84a` | `#c8921c` |
| `--border` | `rgba(200,150,44,.12)` | `rgba(160,114,14,.15)` |

---

## 📄 Pages Summary

| Page | File | Key Features |
|------|------|-------------|
| Home | `home.html` | Hero, Collections preview, About split, Mosaic, Quote, Testimonials |
| Collections | `collection.html` | All 9 products, filter by category, enquiry tray |
| About | `about.html` | Brand story, values grid, timeline, awards |
| Partners | `partners.html` | Partner grid, tier tabs (Retail/Corporate/Hospitality), apply form |
| Reviews | `reviews.html` | Rating summary, masonry reviews, filter, write-a-review form |
| Contact | `contacts.html` | Contact form, map embed, social links, IG feed, FAQ accordion |

---

## 🏷️ Credits

**Brand:** ChocoHunt — Premium Handcrafted Chocolates, Pune  
**Design & Development:** LeadKnight  
**Stack:** HTML5 · CSS3 (Custom Properties) · Vanilla JS · Node.js · Express  
**Images:** Unsplash (free commercial use)  
**Fonts:** Cormorant Garamond · DM Sans (Google Fonts)

---

*© 2024 ChocoHunt. All rights reserved. Website by LeadKnight.*
