+++
title = "Strata Platform"
description = "Distributed infrastructure platform: MonoFS, Guardian, Doctor, Agent, LB-Edge, and more."
+++

Strata is a self-hosted distributed infrastructure platform. Every component works together — from storage and networking to observability and AI — orchestrated by a Kubernetes-style control plane.

## Components

| Component | Role |
|-----------|------|
| **[MonoFS](/tools/#monofs)** | Distributed filesystem — FUSE client, router, 5-node storage cluster, full-text search, OCI registry proxy |
| **[Guardian](/tools/#guardian)** | Control plane — async reconciliation, multi-runtime pushers (Docker, K8s, AWS CDK), partition intent model |
| **[Doctor](/tools/#doctor)** | Telemetry service — OTLP ingest, backpressure pipeline, Grafana-compatible query API |
| **[Agent](/tools/#agent)** | AI agent — FastAPI backend, React 19 frontend, llama.cpp LLM runtime, tool execution |
| **[LB-Edge](/tools/#lb-edge)** | L4 TCP load balancer — registry-backed discovery, K8s agent, circuit breaking, multi-backend proxy |
| **[KVS](/tools/#kvs)** | Versioned key-value store — Pebble + Raft + gRPC, hot/cold tier semantics, strong consistency |
| **[K8s-Top](/tools/#k8s-top)** | Kubernetes metrics scraper — OpenTelemetry export, namespace-aware, distroless deployment |
| **[Packager](/tools/#packager)** | Encrypted archive library — ChaCha20-Poly1305, S3/GCS backends, WORM immutability |
| **[CFG](/tools/#cfg)** | Configuration library — versioned hot/cold tier storage, encryption-at-rest |
| **[Commit-All](/tools/#commit-all)** | AI commit message CLI — zero-dependency, Ollama LLM, dry-run mode |
| **[Stratatools](/tools/#stratatools)** | Platform toolkit — K8s bootstrap manifests, partition configs, Python image utilities |

## Architecture

```
                  ┌──────────────┐
                  │   Guardian    │  Control plane
                  │  reconciliation│  (async reconciliation loop)
                  └──────┬───────┘
                         │ intents
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───┴───┐          ┌────┴────┐         ┌────┴────┐
│MonoFS │          │ LB-Edge │         │ Doctor  │
│ filesystem       │ L4 proxy│         │ telemetry│
└───┬───┘          └────┬────┘         └────┬────┘
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                   ┌────┴────┐
                   │  Agent  │
                   │ AI + LLM │
                   └─────────┘
```

## Quick Start

```bash
# Clone and setup
git clone https://github.com/your-org/strata.git && cd strata

# Start the full platform
./start.sh
```

Access points after startup:

| Service | URL |
|---------|-----|
| Guardian UI | `http://localhost:18090` |
| Container Registry | `http://localhost:5000` |
| MonoFS HTTP | `http://localhost:8080` |
| MonoFS gRPC | `localhost:9090` |

## Quick Links

- [Browse All Components](/tools/)
- [About the Platform](/about/)
- [Read Posts](/posts/)
