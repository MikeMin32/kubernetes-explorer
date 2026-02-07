from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException

_core_v1: client.CoreV1Api | None = None


def _load_config_once() -> None:
    try:
        config.load_incluster_config()
    except ConfigException:
        config.load_kube_config()


def core_v1() -> client.CoreV1Api:
    global _core_v1
    if _core_v1 is None:
        _load_config_once()
        _core_v1 = client.CoreV1Api()
    return _core_v1
