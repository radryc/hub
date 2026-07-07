+++
title = 'Getting Started with Strata'
date = 2026-06-30T12:00:00Z
draft = false
+++

The Strata platform bundles a distributed filesystem, control plane, telemetry pipeline, AI agent, and L4 load balancer — all orchestrated through a single startup command.

## Prerequisites

- **Docker** — running daemon
- **Go** — >=1.22
- **kubectl** — Kubernetes CLI
- **kind** — local Kubernetes clusters
- **uv** — Python package manager (for st-image)

## Quick Start

```bash
# Clone the monorepo
git clone https://github.com/your-org/strata.git && cd strata

# Start everything
./start.sh
```

This one command will:

1. Build `guardianctl` from the `guardian/` directory
2. Create a local kind cluster named `strata`
3. Generate a MonoFS encryption key
4. Build Docker images for MonoFS, Guardian, LB-Edge, and BuildKit
5. Deploy all components into the cluster
6. Release all 11 managed partitions

## Accessing Services

After startup, the following endpoints are available:

| Service | URL | Description |
|---------|-----|-------------|
| Guardian UI | `http://localhost:18090` | Control plane dashboard |
| Container Registry | `http://localhost:5000` | Local OCI image registry |
| MonoFS HTTP | `http://localhost:8080` | Filesystem browser and API |
| MonoFS gRPC | `localhost:9090` | gRPC ingest/query endpoint |

## Key Concepts

### Partitions

A partition is a deployable unit — a Docker container or Kubernetes workload described by a YAML intent file. Guardian watches partition intents and reconciles them into running services. Examples:

- `monofs` — storage cluster
- `guardian-configs` — control plane configuration
- `doctor` — telemetry service
- `agent` — AI agent
- `lb-edge` — load balancer
- `lb-agent` — k8s service discovery agent

### Reconciliation

Guardian runs a continuous reconciliation loop. It compares the declared intent (what you want) with the observed state (what exists) and takes actions to converge them. If a pod crashes, Guardian detects the drift and re-deploys it.

### Image Build Pipeline

Guardian supports two build modes:

- **Source build** — Guardian stages source code, runs `docker build`
- **Tar push** — Guardian loads a pre-built OCI tar and pushes it to the registry

This means you can develop locally with source builds and ship production images as signed tars.

## Releasing Updates

```bash
# Release all partitions with version bumps
cd guardian && go run ./cmd/guardianctl/ release run --all --bump

# Release a single partition and wait for reconciliation
cd guardian && go run ./cmd/guardianctl/ release run --partition doctor --bump --wait

# Release without bumping versions
cd guardian && go run ./cmd/guardianctl/ release run --partition agent --wait
```

## Stopping

```bash
# Scale everything to zero (data persists)
cd guardian && go run ./cmd/guardianctl/ dev stop

# Full teardown
cd guardian && go run ./cmd/guardianctl/ dev destroy
```

## Next Steps

- [Browse all components](/tools/) — detailed descriptions of every service
- [About the platform](/about/) — design principles and architecture
