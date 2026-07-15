# Calypso Insider

Prelaunch funnel + funnel builder for **Calypso Star: Tarot of the Sea**.

## funnel/
The live prelaunch page for `insider.calypsostar.com` — a no-backend email + vote capture funnel.
- `index.html` + `funnel.css` + `funnel.js`
- `assets/` — optimized card art + hero image (~4 MB total)

It captures emails and votes via **Formspree** (endpoint configured in `funnel.js` as `ESP.endpoint`).
The flow: hero → perks → free 3-card draw → Insider poll (email + vote) → deck showcase → social proof → FAQ → final email capture.

### Deploy
Upload the contents of `funnel/` to the web root for `insider.calypsostar.com` on your VPS
(dedicated folder + dedicated server block; do not modify other sites' configs).
`index.html` is the default page.

### Local preview
```
cd funnel
python -m http.server 8139
# open http://localhost:8139/
```

## suite/
The **Funnel Suite** — a no-backend funnel builder. Anyone can make a funnel, change themes,
upload images, add their offer, pick a template, and export a standalone single-file funnel.

### Run
```
cd suite
python -m http.server 8138
# open http://localhost:8138/suite/  (or whatever path you serve it from)
```
Everything is client-side: uploaded images live in the browser's IndexedDB, projects in localStorage.
Use **Export funnel** to download a self-contained `.html` file.

The suite's "Load sample art" pulls from `../funnel/assets/`.

## Notes
- Formspree endpoint is baked into `funnel/funnel.js`. Use a public/form endpoint only.
- No backend, no secrets in the repo.
