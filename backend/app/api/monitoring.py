import os
import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

def get_prom_url() -> str:
    return os.getenv(
        "PROMETHEUS_URL",
        "http://kps-kube-prometheus-stack-prometheus.monitoring.svc.cluster.local:9090",
    )

@router.get("/overview")
async def monitoring_overview():
    prom_url = get_prom_url()

    async with httpx.AsyncClient(timeout=5.0) as client:

        async def q(query: str) -> float:
            r = await client.get(
                f"{prom_url}/api/v1/query",
                params={"query": query},
            )
            r.raise_for_status()
            data = r.json()["data"]["result"]
            return float(data[0]["value"][1]) if data else 0

        return {
            "nodes_total": await q('count(kube_node_info)'),
            "nodes_ready": await q('count(kube_node_status_condition{condition="Ready",status="true"})'),
            "pods_running": await q('count(kube_pod_status_phase{namespace="k8s-explorer",phase="Running"} == 1)'),
            "restarts_15m": await q('sum(increase(kube_pod_container_status_restarts_total{namespace="k8s-explorer"}[15m]))'),
        }
