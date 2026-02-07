from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException

def load_kube_config() -> None:
    try:
        config.load_incluster_config()
    except ConfigException:
        config.load_kube_config()

def core_v1() -> client.CoreV1Api:
    load_kube_config()
    return client.CoreV1Api()
