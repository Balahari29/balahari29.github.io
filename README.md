# balahari29.github.io

Portfolio of **Bala Hariharan B**, fresher Data Analyst in Chennai.
Live at **https://balahari29.github.io** · Recruiter summary: **https://balahari29.github.io/#recruiter**

A plain static site: no framework, no build step, no npm. Theme: "Signal from Chennai" (one dark theme).

## Files
```
index.html     all content as semantic HTML (readable without JavaScript)
styles.css     colour tokens in :root, mobile-first layout (from 360 px up)
main.js        hero canvas (signal + 1,878-star galaxy), SVG charts, recruiter view, nav menu
assets/
  Bala_Hariharan_Resume.pdf
  og.png       1200x630 link-preview image (Open Graph / Twitter), a render of the hero
.nojekyll      tells GitHub Pages to serve the files as they are (no Jekyll processing)
```
Fonts come from Google Fonts (Unbounded, IBM Plex Sans, IBM Plex Mono). The only image is the link preview `assets/og.png`: charts are inline SVG
drawn from the data arrays at the top of `main.js`, and the hero is drawn on a `<canvas>`.

## Preview locally
```bash
cd ~/Desktop/hari/portfolio
python3 -m http.server 8000
# open http://localhost:8000  (and http://localhost:8000/#recruiter for the recruiter view)
```
The hero animation plays once per browser tab session. To see it again, click **Replay signal**, or open the page in a
new tab.

## Edit the content
- **Text:** edit `index.html`. The Recruiter view is the `<aside class="recruiter-panel">` near the end.
- **Chart numbers:** edit the arrays at the top of `main.js` (`DELAY_BUCKETS`, `RFM_SEGMENTS`, `DISTANCE_BANDS`,
  `SKILL_SHARES`) **and** the matching "Show data" table and summary sentence in `index.html`, so the fallback text
  stays in step with the chart.
- **Resume:** replace `assets/Bala_Hariharan_Resume.pdf`, keeping the same file name.
- **Colours:** change the tokens in `:root` at the top of `styles.css`. Amber (`--amber`) is the only "bad / late"
  colour in charts.

## Deploy to GitHub Pages
A user site must live in a repository named exactly `<username>.github.io`.

1. Create the public repository and push (from this folder):
   ```bash
   git init -b main
   git add -A
   git commit -m "Portfolio site"
   gh repo create Balahari29/balahari29.github.io --public --source . --push
   ```
2. Turn on Pages: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder
   `/ (root)`, **Save**. Or from the terminal:
   ```bash
   gh api -X POST repos/Balahari29/balahari29.github.io/pages -f "source[branch]=main" -f "source[path]=/"
   ```
3. Wait one or two minutes, then open https://balahari29.github.io.

Later changes: edit, then `git add -A && git commit -m "..." && git push`. Pages redeploys automatically.

## Accessibility and performance
- Skip link, semantic landmarks, visible focus ring, everything usable by keyboard.
- The project "planets" in the hero are real links placed over the canvas, so they can be tabbed to.
- Recruiter view: a dialog with a focus trap. Escape closes it; it opens automatically at `/#recruiter`.
- `prefers-reduced-motion`: the hero shows its final frame with no animation.
- The animation pauses when the hero is off-screen or the tab is hidden.
- Each chart has an `aria-label`, a one-sentence summary and a "Show data" table.
- Site size excluding fonts and the resume: well under 500 KB.
