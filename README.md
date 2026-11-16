# Portfolio · Syed Mohammad Saad

Personal site of Syed Mohammad Saad, software engineer in Pune: **https://syedmdsaad.github.io/Portfolio/**

It covers FinTwin AI (an AI money copilot for young Indian earners), open-source work on Elasticsearch and Apache Lucene, other projects, two published papers, and how to get in touch.

## How it's built

Plain HTML, CSS and JavaScript with no framework and no build step, served by GitHub Pages from `main`.

- `index.html`: the page
- `styles.css`: design tokens (dark and light themes), layout and animations
- `main.js`: the hero dot field, the live request trace, scroll-driven FinTwin chapters, the ⌘K / Ctrl K command menu, card tilt, count-ups and the contact form
- `assets/`: images, favicon and the social preview card

Every animation respects `prefers-reduced-motion`, and the page reads fine with JavaScript off.

To preview locally:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
