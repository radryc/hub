# Strata engineering hub — `stratasre.com` and `sretoolhub.com`

The static Strata engineering hub lives in [`landing/`](landing/). It is a
multi-page static site with no build step, no framework, and no runtime
dependencies. Upload or connect the folder to Cloudflare Pages and point both
`stratasre.com` and `sretoolhub.com` at it.

`stratasre.com` is the canonical host. `sretoolhub.com` serves the same pages and
inherits the canonical URLs from the HTML, so search engines consolidate the two
domains instead of treating them as duplicate sites.

The hub presents Strata as an open-source, self-hosted project developed in
the open — not as a company or a hosted product. The project is licensed under
the Apache License 2.0.

## What is in the box

```text
landing/
├── index.html            # overview, metrics proof bar, 5 planes, flow, FAQ
├── architecture/
│   └── index.html        # topology SVG, 6 bets, state matrix, ports, failures
├── systems/
│   └── index.html        # filterable 13-repo directory + subsystem deep dives
├── benchmarks/
│   └── index.html        # measured throughput, latency matrix, 150k chaos, nzip R&D
├── security/
│   └── index.html        # pre-WAL privacy, SPIFFE mTLS, AEAD, RBAC, audits
├── 404.html              # on-brand not-found page
├── assets/
│   ├── style.css         # design system + responsive layout
│   ├── tokens.css        # generated Strata UI tokens
│   ├── ui.css            # shared Strata UI primitives
│   ├── theme.js          # applies the saved light/dark theme before paint
│   ├── app.js            # nav, reveals, tabs, copy, filters, tilt, spotlight
│   ├── favicon.svg       # Strata hexagon mark
│   ├── icon-180.png      # Apple touch icon
│   ├── fonts/            # self-hosted Manrope/Space Grotesk/JetBrains Mono
│   └── og.png            # 1200×630 social card
├── _headers              # security + cache headers (Pages)
├── _redirects            # path redirects (host redirect is a zone rule)
├── robots.txt
└── sitemap.xml
```

`wrangler.toml` at the `hub/` root points at `landing/` so direct deployments
can run from `hub/`.

### Hugo is only a build wrapper

`hugo.toml` and `layouts/` exist so hosts that expect a Hugo project (IONOS
Deploy Now, GitHub Pages, or the legacy `hugo` workflow) publish the same page.
The wrapper does not use a theme or the old content:

- `staticDir = ['static', 'landing']` copies the static site into `public/`.
- `layouts/index.html` reads `landing/index.html` directly.
- `disableKinds` disables the old posts, sections, taxonomies, and generated
  sitemap/robots/404 files.
- `disableHugoGeneratorInject = true` keeps the output clean.
- `[minify] disableHTML = true` keeps the HTML byte-stable so the CSP hash for
  the inline JSON-LD stays valid.
- `static/CNAME` pins `sretoolhub.com` for GitHub Pages; `static/.nojekyll`
  keeps the underscore files intact.

Do **not** edit `content/` or add a Hugo theme. Edit `landing/`.

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
5. Open **Custom domains** and add `stratasre.com`, `www.stratasre.com`,
   `sretoolhub.com`, and `www.sretoolhub.com`. Cloudflare will add the DNS
   records for you if the zones are on the same account.
6. Add zone-level Redirect Rules for the `www` hosts:
   - `www.stratasre.com` → `stratasre.com`
   - `www.sretoolhub.com` → `sretoolhub.com`

   Pages `_redirects` cannot match hostnames. If you prefer one canonical host
   for everything, redirect `sretoolhub.com` → `stratasre.com` at the zone level
   instead of attaching it as a second custom domain.

## Deploy from the CLI

```bash
cd hub
npx wrangler pages deploy landing --project-name stratasre
```

The first run opens a browser to authenticate. Later runs reuse the session.
Preview branches can be deployed with `--branch <name>`.

For Hugo-based hosts (IONOS Deploy Now, GitHub Pages), build the wrapper:

```bash
cd hub
hugo --minify
# public/ now contains the new landing page
```

The `sretoolhub-build` workflow does the same thing and uploads `public/` as the
Pages artifact.

## Contact form

The form at `/#contact` sends mail server-side; it no longer depends on the
visitor's mail client. The path is:

```
browser -> POST /api/contact            (functions/api/contact.js, Pages Function)
        -> service binding CONTACT      (wrangler.toml)
        -> stratasre-contact Worker     (contact-worker/)
        -> Cloudflare Email Sending     (send_email binding EMAIL)
```

Configuration lives in `contact-worker/wrangler.toml`:

- `CONTACT_TO` — recipient. Must be a **verified Email Routing destination
  address** in this account while the domain is not onboarded to Email Sending
  (arbitrary recipients need Workers Paid). Today the only verified address is
  `radek.ryckowski@gmail.com`, which is also where `radryc@sretoolhub.com`
  forwards.
- `CONTACT_FROM` — sender; must be an address on a Cloudflare zone in the
  account (`contact@stratasre.com`).
- `destination_address` / `allowed_sender_addresses` — hard restrictions on the
  binding, so a compromised function cannot send anywhere else.
- `workers_dev = false` — the Worker is reachable only through the Pages
  service binding.

Deploy order matters: the Worker first, then the Pages project.

```bash
cd hub/contact-worker && npx wrangler deploy
cd hub && npx wrangler pages deploy landing --project-name stratasre
```

`landing/_routes.json` limits Function invocations to `/api/*`, so static
traffic stays on the free unlimited path. On static-only hosts (GitHub Pages,
Hugo output) the endpoint is absent and the form automatically falls back to a
`mailto:` hand-off with a copy-to-clipboard escape hatch.

Spam controls: hidden `website` honeypot, minimum form fill time (1.5 s), input
length caps, CR/LF stripping before header interpolation, and HTML escaping.
Cloudflare rate limiting can be added at the zone level if volume ever
justifies it.

> Email Routing is enabled on `sretoolhub.com` with no custom rules, so mail to
> `radryc@sretoolhub.com` is dropped unless a forward rule
> (`radryc@sretoolhub.com` -> verified destination) exists. That rule must stay
> in place for the public address and the `mailto:` fallback to work.

## Editing the site

- Overview copy lives in `landing/index.html`; deep-dive pages live in
  `landing/{architecture,systems,benchmarks,security}/index.html`.
- The `#answer` short-answer card is the AI Overview / definition block. Keep it
  factual and under 90 words.
- The Nightwatch section is the adoption path for Sentinel alerts and shadow-mode
  SRE. Keep it outcome-led and framed as a capability inside Agent, not as a
  sixth engine.
- Colors, type, spacing, and breakpoints live in `landing/assets/style.css`.
  Theme tokens come from `landing/assets/tokens.css`; the light theme is the
  `daylight` token set and is toggled by `landing/assets/theme.js`.
- All pages share root-relative asset paths (`/assets/...`).
- To regenerate the social card after changing the positioning, run the script
  in `tools/generate-og.py` from `hub/`:

  ```bash
  cd hub
  python3 tools/generate-og.py
  ```

## Static asset versioning

`_headers` caches `/assets/*` for one year with `immutable`. When you change
`style.css`, `app.js`, `theme.js`, or `tokens.css`, bump the `?v=` query in
all `landing/**/*.html` files (and the `@import` in `style.css`). HTML pages
themselves are served with `must-revalidate`, so cached HTML shells pick up the
new asset URLs immediately.

### If you edit any JSON-LD block

`landing/_headers` uses SHA-256 CSP hashes for every inline
`application/ld+json` script across the hub pages. If you change any JSON-LD
block, recompute the hashes across all HTML files and update `script-src` in
`_headers`:

```bash
python3 - <<'PY'
import base64, hashlib, pathlib, re
for p in sorted(pathlib.Path('landing').rglob('*.html')):
    html = p.read_text(encoding='utf-8')
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        h = base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode()
        print(p, f"'sha256-{h}'")
PY
```

## Positioning note

The page treats **Strata** as the umbrella name and unified surface over the
five open-source engines:

- **MonoFS** — the storage and source fabric
- **Guardian** — the intent-based deployment plane
- **Doctor** — the privacy-first observability plane, including Sentinel alerts
- **LB-Edge** — the traffic plane: L4 registry and TCP proxy
- **Agent** — the approval-gated assistance plane, including Nightwatch

Nightwatch is a mode inside Agent, not a sixth product. It runs in shadow mode:
it watches alerts, investigates with Doctor, and hands off or escalates without
mutating infrastructure. The page presents it as an Agent capability with its own
section and flow step.

"Unified surface" is positioning, not a sixth product. Strata is the front door
and operating context that connects the five. The page should stay GitHub-first:
every primary CTA points at source code or running the project locally, never at
a sales conversation. Primary CTAs point at the
[`radryc/strata`](https://github.com/radryc/strata) umbrella repository, which
maps the component repos and the bootstrap flow. If the project later grows a
company or a hosted offering, that is a positioning change and the hero, CTA,
JSON-LD, and footer should be updated together.

## Native targets

Guardian ships native pushers for:

- **GCP** — OpenTofu-based driver bundle
- **AWS** — CDK/CloudFormation and SDK drivers
- **On-prem Kubernetes** — in-cluster pusher
- **Docker** and **local** — development and small deployments

Keep the target list consistent in the hero lead, short-answer facts, Guardian
layer row, Why section, FAQ, and JSON-LD `runtimePlatform`.

## Search and AI Overview eligibility

The page is built to be eligible for Google Search and AI Overviews. Google has
no special submission form and does not use an `llms.txt` file; eligibility comes
from normal indexing plus clear, well-structured content.

Keep these properties when editing:

- **Crawlable and indexable.** `robots.txt` allows all user agents. The page uses
  `index, follow, max-snippet:-1, max-image-preview:large` and must never add a
  `noindex`, `nosnippet`, or `data-nosnippet` directive.
- **Answer-first content.** The `#answer` section gives a concise definition of
  Strata near the top of the page. Keep it factual and under 90 words.
- **Question-shaped headings.** The FAQ section uses the questions people
  actually search for (`What is Strata?`, `Is Strata free?`, `How do I install
  Strata?`). Keep each answer short, specific, and consistent with the visible
  page copy.
- **Structured data.** The JSON-LD `@graph` contains `WebSite`,
  `SoftwareSourceCode` + `SoftwareApplication`, `Person` (the maintainer), and
  `FAQPage`. If the FAQ copy changes, update both the visible HTML and the JSON-LD
  answers so they match.
- **Freshness.** Update the `<time datetime>` in the short-answer card and footer,
  `dateModified` in the JSON-LD, and `<lastmod>` in `sitemap.xml` whenever the
  page changes.
- **E-E-A-T.** Link claims to the public repositories and keep the maintainer
  identity (`@radryc`) and license visible in the footer.
- **Performance.** The page is static, uses local fonts, and has no runtime
  dependencies. Do not add a framework, third-party analytics, or blocking
  scripts without measuring Core Web Vitals.

If you add an FAQ entry, add the matching `Question`/`Answer` pair to the
`FAQPage` JSON-LD as well.


