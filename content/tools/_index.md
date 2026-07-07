+++
title= "Components"
description= "Strata platform components directory"
+++

Everycomponent in the Strata platform. Each is independently buildable and testable, connected through gRPC and Guardian's partition intent model.

---

##MonoFS

**Distributedfilesystem** — FUSE client, router, 5-node storage cluster, full-text search index, OCI registry proxy.

-HRW-consistent sharding with replication and automated failover
-FUSE mount for local filesystem access to distributed data
-Full-text search index with diagnostics endpoint
-OCI registry proxy — pull-through caching for Docker images
-gRPC APIs for all operations (ingest, query, search, admin)
-Structured logging via `log/slog` with correlation IDs

**Repo**:`monofs/`

---

##Guardian

**Controlplane** — async reconciliation loop, declarative partition intents, multi-runtime pushers.

-Partition intent model: declare desired state, Guardian converges reality
-Pusher runtimes: Kubernetes, Docker, AWS CDK, local
-Image build pipeline: source builds or pre-built OCI tar push
-OpenTelemetry instrumentation: traces, metrics, structured logs
-Web UI at `http://localhost:8090` for cluster visibility
-`guardianctl` CLI for bootstrap, release, and partition management

**Repo**:`guardian/` |

---

##Doctor

**Telemetryingest/query** — OTLP receiver, backpressure pipeline, Grafana-compatible API.

-Accepts OTLP traces, metrics, and logs
-WAL-backed buffers with cost-based backpressure
-Query API compatible with Grafana datasource plugins
-Multi-stage Dockerfile on distroless base
-Self-telemetry via OpenTelemetry

**Repo**:`doctor/`

---

##Agent

**AIagent service** — FastAPI backend, React 19 frontend, llama.cpp LLM runtime.

-Chat interface with tool execution (calculate, file operations, web)
-WebSocket streaming for real-time LLM token delivery
-Docker Compose for coordinated multi-service startup
-OpenTelemetry instrumentation
-Settings management via JSON configuration

**Repo**:`agent/`

---

##LB-Edge

**L4TCP load balancer** — registry, proxy, Kubernetes service discovery, circuit breaking.

-Clean separation: edge entrypoint, registry backend store, proxy data plane, k8s agent
-Bootstrap string configuration for multi-backend pairing
-gRPC control plane for backend registration and health checks
-Distroless container image (static-debian12:nonroot)
-Multi-stage Dockerfile

**Repo**:`lb/`

---

##KVS

**Versionedkey-value store** — Pebble LSM engine + Raft consensus + gRPC API.

-Hot/cold tier semantics with configurable compaction
-Protobuf API with streaming operations (Watch, List, Snapshot)
-Strongly consistent reads and writes through Raft
-Prometheus metrics export
-Designed as Guardian's backing configuration store

**Repo**:`kvs/`

---

##K8s-Top

**Kubernetesmetrics scraper** — OpenTelemetry export, namespace-aware collection.

-Scrapes pod, node, and namespace resource metrics
-Exports via OpenTelemetry protocol to Doctor or any OTLP receiver
-Distroless container image
-Modern K8s client libraries (v0.32+)

**Repo**:`k8s-top/`

---

##Packager

**Encryptedarchive library** — ChaCha20-Poly1305, S3/GCS backends, WORM immutability.

-Authenticated encryption with random nonces per archive
-Cloud storage backends: S3, GCS
-WORM (write once, read many) semantics
-90.8% test coverage on core package
-Clean interface-driven architecture

**Repo**:`packager/` |

---

##CFG

**Configurationlibrary** — versioned hot/cold tier storage with encryption.

-Versioned configuration with snapshot and rollback
-Hot tier (memory) and cold tier (disk/Pebble) storage
-Encryption-at-rest with key length validation
-Path traversal prevention on file operations
-Used by Guardian for partition config management

**Repo**:`cfg/`

---

##Commit-All

**AIcommit message CLI** — zero external dependencies, Ollama LLM integration.

-Reads git diff, sends to Ollama, writes structured commit message
-`cleanResponse` strips commentary and thinking blocks from LLM output
-Dry-run mode for safe preview before committing
-Zero-dependency design (stdlib only)

**Repo**:`commit-all/`

---

##Stratatools

**Platformtoolkit** — K8s bootstrap manifests, partition configs, Python utilities.

-37 K8s templates for MonoFS + Guardian + LB-Edge deployment
-Partition config files for all managed components
-Python CLI: `st-image` (image build/push) and `st-aws-setup` (IAM Roles Anywhere)
-`envsubst`-compatible template rendering
-Bootstrap orchestration via `guardianctl`

**Repo**:`stratatools/`
