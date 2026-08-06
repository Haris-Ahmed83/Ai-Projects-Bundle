# Ai Projects Bundle

> 730 AI-focused web projects — auto-generated 2 per day for 365 days.

A hands-on collection of **730 web projects** spanning AI, ML, Data Science, and modern web tech. Published automatically **2 per day** over **1 year**. Every project is self-contained with complete source code and documentation.

---

## Structure

```
Ai-Projects-Bundle/
├── month-01/    # Projects   1 -  62 (Days  1-31)
├── month-02/    # Projects  63 - 118 (Days 32-59)
├── month-03/    # Projects 119 - 180 (Days 60-90)
├── month-04/    # Projects 181 - 240 (Days 91-120)
├── month-05/    # Projects 241 - 302 (Days 121-151)
├── month-06/    # Projects 303 - 362 (Days 152-181)
├── month-07/    # Projects 363 - 424 (Days 182-212)
├── month-08/    # Projects 425 - 486 (Days 213-243)
├── month-09/    # Projects 487 - 546 (Days 244-273)
├── month-10/    # Projects 547 - 608 (Days 274-304)
├── month-11/    # Projects 609 - 668 (Days 305-334)
├── month-12/    # Projects 669 - 730 (Days 335-365)
└── scripts/
    ├── generate.py          # AI-powered project generator
    ├── fallback_projects.json  # Backup projects if APIs fail
    └── requirements.txt
```

Each project folder:
```
NNN-project-slug/
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## How The Automation Works

| Feature | Detail |
|---------|--------|
| **Schedule** | 10 AM PKT + 11 AM PKT daily |
| **Projects/day** | 2 |
| **Total duration** | 365 days (1 year) |
| **AI Engine** | LongCat 2.0 (primary) / Gemini (backup) |
| **Keepalive** | Every 45 days (prevents GitHub 60-day kill) |
| **Catch-up** | Auto-generates extra if days are missed |
| **Fallback** | 20 pre-built projects if all APIs fail |
| **Duplicate prevention** | Full history tracking in `progress.json` |

---

## Run Any Project Locally

```bash
cd month-01/001-project-name
open index.html
```

No build step. No dependencies. Just open in a browser.

---

## Run Generator Locally

```bash
# Setup
pip install -r scripts/requirements.txt

# Add keys to .env
echo "LONGCAT_API_KEY=your_key" >> .env
echo "GEMINI_API_KEY=your_key" >> .env

# Generate projects
python scripts/generate.py
```

---

## Tech Stack Progression

| Months | Projects | Focus |
|--------|----------|-------|
| 1-3 | 1-180 | HTML5, CSS3, Vanilla JS, DOM APIs |
| 4-6 | 181-362 | React, APIs, Async patterns |
| 7-9 | 363-546 | Node.js, Express, Databases |
| 10-12 | 547-730 | Full Stack, Real-time, Advanced |

---

## Author

**HarisAhmed83** — https://github.com/Haris-Ahmed83
