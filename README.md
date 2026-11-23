# Strata Platform Hub

> **Start here:** [`github.com/radryc/strata`](https://github.com/radryc/strata) is
> the umbrella repository — the front door, component map, and bootstrap notes
> for the whole project.

Engineering hub for the Strata open-source infrastructure platform — 13
public repositories and 5 connected planes built and maintained in the open by `@radryc`. Covers
MonoFS, Guardian, Doctor, LB-Edge, Agent (including shadow-mode Nightwatch),
`sqlagregator`, `kvs`, `packager`, `cfg`, `tlsx`, `aws`, and `k8s-top`, with native support for GCP, AWS, and on-prem
Kubernetes.

The static site in [`landing/`](landing/) is the **single source of truth**:

- `/` (`landing/index.html`) — Overview, measured proof bar, 5 planes, interactive flow, Nightwatch, engineering log, primitives, and FAQ
- `/architecture/` (`landing/architecture/index.html`) — System topology SVG, six core bets, durability & state ownership, wire ports, failure playbook, and candid boundaries
- `/systems/` (`landing/systems/index.html`) — Filterable 13-repository directory, language distribution, and subsystem deep dives
- `/benchmarks/` (`landing/benchmarks/index.html`) — Measured throughput & latency matrix, `kind-strata` soak/failover results, 150k-target chaos budgets, and standalone `nzip` R&D ablations
- `/security/` (`landing/security/index.html`) — Pre-WAL privacy funnel, `tlsx` SPIFFE mTLS, ChaCha20/AES-256-GCM encryption, compiled RBAC, SSRF `netguard`, and hash-chained ledgers

Hugo is kept only as a build wrapper for hosts that expect a Hugo project; it
copies `landing/` into `public/` verbatim.

## Quick Start

Preview the static site directly from `landing/` so root-relative `/assets/*` and subpage routes resolve cleanly:

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
the pages carry SHA-256 CSP hashes for their inline JSON-LD blocks.

## Deploy

Both domains serve the same static site:

- `stratasre.com` — canonical host
- `sretoolhub.com` — same site; canonical remains `stratasre.com`

For Cloudflare Pages, see [`LANDING.md`](LANDING.md). The project is
`stratasre` and the output directory is `landing/`.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).

---

[![Deploy to IONOS](https://images.ionos.space/deploy-now-icons/deploy-to-ionos-btn.svg)](https://ionos.space/setup)
