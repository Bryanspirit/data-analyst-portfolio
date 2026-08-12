# Bryan Opoku Mawunyo Kofi

**Strategy and research analyst, energy systems and development**

Live at **https://bryanspirit.github.io/data-analyst-portfolio/**

A static, dependency-free portfolio site aimed at strategy and research roles in energy
transition, energy access and development policy. Companion to the AI and software
portfolio at [bryanspirit.github.io](https://bryanspirit.github.io).

## What is here

```
index.html                   the whole page, all content lives here
assets/css/style.css         tokens, layout, diagram and chart styling
assets/js/main.js            theme, filters, systems map, load-shift panel
.github/workflows/pages.yml  deploys on every push to main
```

No build step, no framework, no npm install. Open `index.html` in a browser and it works.

## Still to fill in

Search `index.html` for **`TODO`**. Six things are marked:

1. **Star Assurance start date.** Currently the timeline shows only "Present".
2. **Years for the four research projects.** The dossiers show scope but no dates.
3. **Affiliation for the Tema Central energy study** (independent, academic, or other).
4. **Data type used in the GIZ programme** (survey, secondary, administrative).
5. **Languages beyond English.** Fieldwork languages matter for Global South research,
   so Twi, Ewe, Ga or French are worth listing if you have them.
6. **Web analytics tools you have actually used.** GA4, Tag Manager, Search Console and
   Looker Studio are deliberately left off until you confirm them.

## The six infographics

The page is built around diagrams rather than paragraphs. All of them are hand-authored
inline SVG, styled from the same CSS tokens, so they follow the light and dark themes
without a redraw.

| Where | What it shows | Interactive |
|---|---|---|
| Hero | Grid-and-node motif, the electricity network abstracted | pulse only |
| Approach | Three-field intersection: energy systems, development policy, applied analytics | no |
| Approach | The four-stage method spine, with the feedback loop back to stage 01 | no |
| Systems view | The Tema Central explanatory model, seven nodes | **yes**, select a node to trace its connections |
| Research intro | Method by programme matrix, eight methods against four programmes | no |
| Research 01 | The five data sources converging into one analytical picture | no |
| Research 01 | Demand-side management load-shift panel | **yes**, slider |
| Research 02 | The food system causal chain, production through to outcome | no |
| Research 03 | The sovereign risk analytical pipeline, indicators to dashboard | no |
| Research 04 | The four adoption drivers and where a transition stalls | no |
| Experience | Study and work on one timeline, 2021 to present | no |
| Technical | The toolkit as a six-layer working sequence, raw data to decision | no |

The matrix rows live in `assets/js/main.js` (search `ROWS`), so adding a method or a
programme is a one-line edit rather than hand-written SVG. A cell is filled only where the
CV states the method was used on that programme; nothing is scored or weighted.

## House rules

- **No em dashes** anywhere in the copy, matching the other portfolio.
- **No invented figures.** The only numbers rendered anywhere on the page come from the
  demand-side management panel, which is an idealised load shape labelled as a schematic
  directly above the chart. No research result is represented by a made-up number, and
  nothing in the research dossiers is quantified beyond what the CV states.
- **Keep the schematic notice.** If you change the load-shift panel, the warning block
  above it has to stay accurate.

## Charts and colour

Data marks use the dataviz reference palette, validated for colour-vision deficiency
against both the light and dark chart surfaces:

| role | light | dark |
|---|---|---|
| series 1 | `#2a78d6` | `#3987e5` |
| series 2 | `#eb6834` | `#d95926` |
| series 3 | `#1baf7a` | `#199e70` |

The burnt-orange UI accent (`#c2410c` light, `#f97316` dark) is deliberately outside that
set, so a brand colour never impersonates a data series. The load-shift chart carries a
legend and a table view of the same numbers.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which publishes the repository
root to GitHub Pages. Nothing is built, the files are uploaded as they are.

To run locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
