# K8sX — Kubernetes Explorer & Observer

🚀 Live demo: **http://k8sx.tech**  
K8sX is a Kubernetes cluster exploration web app with a clean UI for browsing cluster resources and inspecting details in real time.

---

## What it does

K8sX helps you:
- browse **Nodes / Namespaces / Pods**
- view **pod details** (metadata, labels, status, node placement)
- fetch **pod logs** directly from Kubernetes API (RBAC secured)
- navigate the cluster as a **tree** for faster discovery
- use a lightweight **gateway (Nginx)** to serve the frontend and proxy `/api` requests

---

## Key features

### Explorer UI
- Resource tree navigation (fast context switching)
- Clean details panel layout for resource inspection
- Logs viewer (tail lines, quick fetch)
- Responsive “desktop-like” UX styling for better readability

### Backend API (FastAPI)
- `/nodes`, `/pods`, and resource inspection endpoints
- logs endpoint using Kubernetes CoreV1 API (`read_namespaced_pod_log`)
- CORS-ready for browser clients
- Designed for extending with metrics, events, and advanced filtering

### Gateway (Nginx)
- Serves built frontend static assets
- Proxies `/api/*` to backend
- Production-friendly and easy to ship as a single container

---

## Architecture

**High level flow**
1. User opens **http://k8sx.tech**
2. Requests go to **Traefik Ingress**
3. `/` routes to **Gateway (Nginx)** → serves frontend
4. `/api` routes to **Backend (FastAPI)** → talks to Kubernetes API server
5. Backend returns data to frontend

**Components**
- **Frontend**: React + TypeScript (bundled with Vite)
- **Backend**: FastAPI + Kubernetes Python client
- **Gateway**: Nginx (static + reverse proxy)
- **Kubernetes**: K3s (production VM), Kind (local dev)
- **Ingress**: Traefik
- **Packaging**: Helm chart
- **Registry**: GHCR (GitHub Container Registry)

---

## DevOps highlights

### Helm-managed deployment
- Single Helm release contains backend, gateway, services, ingress, RBAC
- Values-driven configuration (images, tags, replicas)

### RBAC security
Backend runs under a dedicated **ServiceAccount** and is granted **minimal required permissions**.
Example: log access requires explicit permission to `pods/log` subresource.

### CI/CD approach
- Images are built and tagged
- Published to **GHCR**
- Updated via **helm upgrade** on the VM

### Environments
- **Local dev**: Kind cluster for rapid iteration and image testing
- **Production**: VM with K3s + Traefik + public ingress

---

## Deployment

### Local (Kind)
Typical workflow:
1) build gateway image locally  
2) load image into kind  
3) update deployment image  
4) test UI & API paths

### Production (VM / K3s)
High level:
1) build & push images to GHCR  
2) `helm upgrade` release with new image tags  
3) Traefik routes traffic to services via Ingress

---


## Demo
🌍 **http://k8sx.tech**

If you like the project or want to collaborate — feel free to open an issue or reach out.

