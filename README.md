<div align="center">
  <img src="assets/logo.svg" alt="OpenHisaab Clay Gulak Logo" width="140" height="140" />
  <h1>OpenHisaab</h1>
  <p><strong>Save Wisely • Authentic Clay Gulak Monthly Expense & Budget Manager</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
  [![Kubernetes Ready](https://img.shields.io/badge/Kubernetes-Ready-blue.svg)](#kubernetes-deployment)
  [![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED.svg)](#docker--docker-compose)
</div>

> **OpenHisaab** is a cloud-native, enterprise-ready open-source expense tracker and cashflow manager. It supports **PostgreSQL, CockroachDB, MySQL, Microsoft SQL Server (MSSQL), and MongoDB**, with out-of-the-box Kubernetes manifests, health checks, and Docker Compose profiles.

---

## 🗄️ Supported Database Engines

OpenHisaab uses a unified Database Adapter architecture. Configure your database simply by setting the `DB_TYPE` and connection parameters:

| Database | `DB_TYPE` Value | Default Port | Connection Variable / URL Example |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `postgres` | `5432` | `postgresql://user:pass@host:5432/openhisaab` |
| **CockroachDB** | `cockroachdb` | `26257` | `postgresql://root@host:26257/openhisaab?sslmode=disable` |
| **MySQL / MariaDB** | `mysql` | `3306` | `mysql://user:pass@host:3306/openhisaab` |
| **Microsoft SQL Server** | `mssql` | `1433` | `Server=host,1433;Database=openhisaab;User Id=sa;Password=pass;` |
| **MongoDB** | `mongodb` | `27017` | `mongodb://user:pass@host:27017/openhisaab?authSource=admin` |
| **In-Memory Store** | `memory` | N/A | *(Zero external database required, ideal for testing)* |

---

## ☸️ Kubernetes Deployment

Production-ready manifests are located in the `k8s/` directory:

```
k8s/
├── 00-namespace.yaml       # Dedicated 'openhisaab' namespace
├── 01-configmap.yaml       # Database provider, ports, pool size
├── 02-secret.yaml          # Database credentials & connection string
├── 03-deployment.yaml      # 2 replicas, rolling updates, security context & probes
├── 04-service.yaml         # ClusterIP service exposing port 80
├── 05-ingress.yaml         # NGINX Ingress with TLS support
└── kustomization.yaml      # Kustomize root
```

### 1-Command Deploy via Kustomize

```bash
kubectl apply -k ./k8s
```

### Health Probes for Kubernetes
- **Liveness Probe**: `GET /healthz` (Verifies HTTP service responsiveness)
- **Readiness Probe**: `GET /readyz` (Verifies database connectivity before directing cluster traffic)
- **Zero-Downtime Rolling Updates**: Uses `preStop` hook and graceful connection draining.

---

## 🐳 Docker & Docker Compose

Launch OpenHisaab locally alongside any supported database with one command:

```bash
# 1. Run with PostgreSQL
docker compose --profile postgres up

# 2. Run with CockroachDB
docker compose --profile cockroachdb up

# 3. Run with MySQL
docker compose --profile mysql up

# 4. Run with Microsoft SQL Server (MSSQL)
docker compose --profile mssql up

# 5. Run with MongoDB
docker compose --profile mongodb up

# 6. Run Standalone (In-Memory)
docker compose up
```

Access the dashboard at `http://localhost:8080`.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP Server port | `8080` |
| `DB_TYPE` | `postgres` \| `cockroachdb` \| `mysql` \| `mssql` \| `mongodb` \| `memory` | `memory` |
| `DATABASE_URL` | Full connection URI (auto-detects provider if set) | `""` |
| `DB_HOST` | Database server hostname | `localhost` |
| `DB_PORT` | Database server port | *(driver default)* |
| `DB_NAME` | Database name | `openhisaab` |
| `DB_USER` | Database username | `postgres` / `root` / `sa` |
| `DB_PASSWORD` | Database password | `""` |
| `DB_POOL_MAX` | Max connection pool size | `10` |
| `DB_SSL` | Enable SSL encryption (`true` / `false`) | `false` |

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/asgharahmed78692/openhisaab.git
cd openhisaab

# Install dependencies
npm install

# Start development server with file watching
npm run dev

# Or start in standalone offline mode by opening index.html directly
start index.html
```

---

## 📄 License

Distributed under the **MIT License**.
