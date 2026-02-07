from datetime import datetime, timezone
from fastapi import APIRouter
from kubernetes.client import V1Node

from app.core.k8s import core_v1

router = APIRouter(prefix="", tags=["k8s"])

def _age_seconds(ts: datetime | None) -> int | None:
    if not ts:
        return None
    now = datetime.now(timezone.utc)
    ts = ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
    return int((now - ts).total_seconds())

def _node_ready_status(node: V1Node) -> str:
    conditions = node.status.conditions or []
    for c in conditions:
        if c.type == "Ready":
            return "Ready" if c.status == "True" else "NotReady"
    return "Unknown"

@router.get("/nodes")
def list_nodes():
    v1 = core_v1()
    nodes = v1.list_node().items

    items = []
    for n in nodes:
        labels = n.metadata.labels or {}
        roles = []
        if "node-role.kubernetes.io/control-plane" in labels or "node-role.kubernetes.io/master" in labels:
            roles.append("control-plane")

        items.append({
            "name": n.metadata.name,
            "status": _node_ready_status(n),
            "roles": roles,
            "kubeletVersion": getattr(n.status.node_info, "kubelet_version", None),
            "ageSeconds": _age_seconds(n.metadata.creation_timestamp),
            "labels": labels,
        })

    return {"items": items}


@router.get("/namespaces")
def list_namespaces():
    v1 = core_v1()
    namespaces = v1.list_namespace().items

    items = []
    for ns in namespaces:
        items.append({
            "name": ns.metadata.name,
            "status": ns.status.phase,
            "ageSeconds": _age_seconds(ns.metadata.creation_timestamp),
            "labels": ns.metadata.labels or {},
        })

    return {"items": items}


@router.get("/pods")
def list_pods(namespace: str):
    v1 = core_v1()
    pods = v1.list_namespaced_pod(namespace=namespace).items

    items = []
    for p in pods:
        restarts = 0
        if p.status.container_statuses:
            restarts = sum(cs.restart_count for cs in p.status.container_statuses)

        items.append({
            "name": p.metadata.name,
            "namespace": p.metadata.namespace,
            "status": p.status.phase,
            "nodeName": p.spec.node_name,
            "restarts": restarts,
            "ageSeconds": _age_seconds(p.metadata.creation_timestamp),
            "labels": p.metadata.labels or {},
        })

    return {"items": items}

@router.get("/pods/{namespace}/{name}")
def pod_details(namespace: str, name: str):
    v1 = core_v1()
    p = v1.read_namespaced_pod(name=name, namespace=namespace)

    restarts = 0
    statuses = []
    if p.status.container_statuses:
        for cs in p.status.container_statuses:
            statuses.append({
                "name": cs.name,
                "ready": cs.ready,
                "restartCount": cs.restart_count,
                "image": cs.image,
            })
            restarts += cs.restart_count

    return {
        "name": p.metadata.name,
        "namespace": p.metadata.namespace,
        "status": p.status.phase,
        "nodeName": p.spec.node_name,
        "podIP": p.status.pod_ip,
        "hostIP": p.status.host_ip,
        "restarts": restarts,
        "ageSeconds": _age_seconds(p.metadata.creation_timestamp),
        "labels": p.metadata.labels or {},
        "containers": [
            {"name": c.name, "image": c.image}
            for c in (p.spec.containers or [])
        ],
        "containerStatuses": statuses,
    }

@router.get("/pods/{namespace}/{name}/logs")
def pod_logs(namespace: str, name: str, tailLines: int = 50):
    v1 = core_v1()
    text = v1.read_namespaced_pod_log(
        name=name,
        namespace=namespace,
        tail_lines=tailLines,
        timestamps=False,
    )
    return {
        "namespace": namespace,
        "pod": name,
        "tailLines": tailLines,
        "lines": text.splitlines(),
    }