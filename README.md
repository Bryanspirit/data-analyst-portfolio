# Bryan Opoku, data analyst portfolio

Live at **https://bryanspirit.github.io/data-analyst-portfolio/**

A static, dependency-free portfolio site aimed at data analyst roles. Companion to the
AI and software portfolio at [bryanspirit.github.io](https://bryanspirit.github.io).

## What is here

```
index.html                 the whole page, content lives here
assets/css/style.css       tokens, layout, chart marks
assets/js/main.js          theme, accordion, filters, the demo charts
.github/workflows/pages.yml  deploys on every push to main
```

No build step, no framework, no npm install. Open `index.html` in a browser and it works.

## Editing the content

Everything you are likely to change is in `index.html`, and each area is marked with a
comment.

**Add a case study.** Copy any `<article class="rec">` block in section `#records`, then:

1. bump the `R-0n` label,
2. give the body a new `id` and point the button's `aria-controls` at it,
3. set `data-cat` to one of the filter values (`insurance`, `reporting`, `text`, `operations`),
4. fill in the five rows: Question, Data, Method, Finding, Decision.

**Add a filter.** Add a `<button type="button" class="fbtn" data-f="yourcat">` to the filter
row and use `data-cat="yourcat"` on the records. The count text updates itself.

**Trim the toolkit.** Section `#toolkit`. Keep only what you have actually used in anger,
because an interviewer will pick one at random and ask about it.

## House rules

- **No em dashes** anywhere in the copy, matching the other portfolio.
- **No real figures.** Where a result is commercially sensitive the direction is stated
  without the underlying numbers, and the feature ranking in R-01 says so explicitly.
- **The demo is synthetic and labelled as such.** The 400 claims in the threshold explorer
  are generated in the browser from a fixed seed. They are not real claims data and the
  notice above the charts says so. If you change the demo, keep the notice.

## Charts

The palette is the dataviz reference palette, validated for colour-vision deficiency in
both light and dark mode:

| role | light | dark |
|---|---|---|
| series 1 | `#2a78d6` | `#3987e5` |
| series 2 | `#eb6834` | `#d95926` |
| series 3 | `#1baf7a` | `#199e70` |
| critical (status) | `#d03b3b` | `#d03b3b` |

Status colours are reserved for state and are never reused as a series colour. Both charts
carry a legend, and the score distribution has a table view for anyone not reading the
picture.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which publishes the repository
root to GitHub Pages. Nothing is built, the files are uploaded as they are.

To run locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
