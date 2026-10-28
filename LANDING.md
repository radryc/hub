# Strata landing page — `stratasre.com`

The static Strata landing page lives in [`landing/`](landing/). It is a single-page
site with no build step, no framework, and no runtime dependencies. Upload or
connect the folder to Cloudflare Pages and point `stratasre.com` at it.

The page presents Strata as an open-source, self-hosted project developed in
the open — not as a company or a hosted product. The project is licensed under
the Apache License 2.0.

## What is in the box

```text
landing/
├── index.html            # the page
├── 404.html              # on-brand not-found page
├── assets/
│   ├── style.css         # design system + responsive layout
│   ├── app.js            # nav, reveals, tabs, copy, spotlight
│   ├── favicon.svg       # Strata hexagon mark
│   └── og.png            # 1200×630 social card
├── _headers              # security + cache headers (Pages)
├── _redirects            # path redirects (host redirect is a zone rule)
├── robots.txt
└── sitemap.xml
```

`wrangler.toml` at the repo root points at `landing/` so direct deployments can
run from `hub/`.

## Deploy with the Cloudflare dashboard

1. Push this repository to GitHub/GitLab.
2. In **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**,
   choose the repository.
3. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Build command | *(leave empty)* |
   | Build output directory | `hub/landing` |

   If you set the **Root directory** to `hub`, use `landing` as the output
   directory instead.
4. Deploy. Cloudflare serves `index.html` at the site root and `404.html` for
   unknown paths automatically.
5. Open **Custom domains** and add `stratasre.com` and `www.stratasre.com`.
   Cloudflare will add the DNS records for you if the zone is on the same
   account. Add a zone-level Redirect Rule for `www.stratasre.com` →
   `stratasre.com`; Pages `_redirects` cannot match hostnames.

## Deploy from the CLI

```bash
cd hub
npx wrangler pages deploy landing --project-name stratasre
```

The first run opens a browser to authenticate. Later runs reuse the session.
Preview branches can be deployed with `--branch <name>`.

## Editing the page

- Copy, product claims, and section order all live in `landing/index.html`.
- Colors, type, spacing, and breakpoints live at the top of
  `landing/assets/style.css` under `:root`.
- The four product cards and the code examples are deliberately aligned with
  `docs/products/{monofs,guardian,doctor,agent}.md`.
- To regenerate the social card after changing the positioning, run the script
  in `tools/generate-og.py` from `hub/`:

  ```bash
  cd hub
  python3 tools/generate-og.py
  ```

### If you edit the JSON-LD block

`landing/_headers` uses a CSP hash for the inline `application/ld+json` script.
If you change that block, recompute the hash and replace the `sha256-…` value
in `_headers`:

```bash
python3 - <<'PY'
import base64, hashlib, re
html = open('landing/index.html', encoding='utf-8').read()
body = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S).group(1)
print(base64.b64encode(hashlib.sha256(body.encode()).digest()).decode())
PY
```

## Positioning note

The page treats **Strata** as the umbrella name and unified surface over the
four open-source engines:

- **MonoFS** — the storage and source fabric
- **Guardian** — the intent-based deployment plane
- **Doctor** — the privacy-first observability plane
- **Agent** — the approval-gated assistance plane

"Unified surface" is positioning, not a fifth product. Strata is the front door
and operating context that connects the four. The page should stay GitHub-first:
every primary CTA points at source code or running the project locally, never at
a sales conversation. Primary CTAs point at the
[`radryc/strata`](https://github.com/radryc/strata) umbrella repository, which
maps the component repos and the bootstrap flow. If the project later grows a
company or a hosted offering, that is a positioning change and the hero, CTA,
JSON-LD, and footer should be updated together.

## Before going live

- [ ] Confirm the `github.com/radryc/strata` umbrella repository and the
      `github.com/radryc` profile resolve, along with MonoFS, Guardian, Doctor,
      and Agent.
- [ ] Replace or confirm the canonical host in `index.html`, `robots.txt`, and
      `sitemap.xml` if the domain changes.
- [ ] Check the site on a phone at 390 px wide.
- [ ] Run Lighthouse against the deployed URL.
- [ ] Optionally enable Cloudflare Web Analytics in the Pages project.
