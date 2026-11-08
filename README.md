# Strata Platform Hub

> **Start here:** [`github.com/radryc/strata`](https://github.com/radryc/strata) is
> the umbrella repository — the front door, component map, and bootstrap notes
> for the whole project.

Landing page for the Strata distributed infrastructure platform — an open-source
project built and maintained in the open by one developer. Covers MonoFS,
Guardian, Doctor, LB-Edge, Agent, and Nightwatch, with native support for GCP,
AWS, and on-prem Kubernetes. The page includes a short answer, a five-engine
stack tour, release notes, primitives, and an FAQ.

The static site in [`landing/`](landing/) is the **single source of truth**.
Hugo is kept only as a build wrapper for hosts that expect a Hugo project; it
copies `landing/` into `public/` verbatim. There is no separate Hugo theme or
content design anymore.

## Quick Start

Preview the static page directly:

```bash
cd landing
python3 -m http.server 8000
```

Or build the Hugo wrapper and preview that:

```bash
hugo server -D
```

Open http://localhost:1313 in your browser.

## Build

```bash
hugo --minify
```

Output goes to `public/`. HTML minification is disabled in `hugo.toml` because
the page carries a CSP hash for its inline JSON-LD.

## Deploy

Both domains serve the same static page:

- `stratasre.com` — canonical host
- `sretoolhub.com` — same page; canonical remains `stratasre.com`

For Cloudflare Pages, see [`LANDING.md`](LANDING.md). The project is
`stratasre` and the output directory is `landing/`.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

---

[![Deploy to IONOS](https://images.ionos.space/deploy-now-icons/deploy-to-ionos-btn.svg)](https://ionos.space/setup)
