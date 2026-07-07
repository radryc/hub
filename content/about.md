+++
title = "About"
description = "About the Strata Platform"
+++

Strata is a self-hosted distributed infrastructure platform built from the ground up for running production services. Every layer — storage, networking, observability, configuration, and deployment — is purpose-built and integrated through a common control plane.

## What Strata Provides

- **Distributed filesystem** (MonoFS) with FUSE mounting, full-text search, and OCI registry mirroring
- **Control plane** (Guardian) with declarative intents, async reconciliation, and multi-runtime deployment
- **Telemetry pipeline** (Doctor) ingesting OTLP traces and metrics with a Grafana-compatible query API
- **AI agent service** (Agent) running local LLMs for chat, tool execution, and automated operations
- **L4 load balancer** (LB-Edge) with registry-backed discovery, K8s agent, and circuit breaking
- **Versioned KV store** (KVS) providing strongly consistent configuration storage with hot/cold tiering
- **Security-first packaging** (Packager) with authenticated encryption and cloud storage backends

## Design Principles

1. **Self-hosted** — Runs on your own infrastructure. No SaaS dependencies.
2. **Composable** — Every component has a focused job and clean gRPC interfaces.
3. **Observable** — OpenTelemetry instrumentation throughout. Every service exports traces and metrics.
4. **Declarative** — Guardian intents describe desired state. The control loop makes it real.
5. **Versioned** — Configs, partitions, and KV data are all versioned for audit and rollback.

## Repository

All components live in a monorepo under `github.com/your-org/strata`. The Guardian control plane orchestrates everything via `start.sh` or `guardianctl`.
