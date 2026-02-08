import { api } from "./client";
import type { NodeItem, NamespaceItem, PodListItem, PodDetails } from "./types";

export async function getNodes(): Promise<NodeItem[]> {
  const { data } = await api.get("/nodes");
  return data;
}

export async function getNamespaces(): Promise<NamespaceItem[]> {
  const { data } = await api.get("/namespaces");
  return data;
}

export async function getPods(namespace: string): Promise<PodListItem[]> {
  const { data } = await api.get("/pods", { params: { namespace } });
  // очікуємо [{name, namespace}] або [{name}] — підлаштуємося:
  return (data ?? []).map((p: any) => ({
    name: p.name,
    namespace: p.namespace ?? namespace,
  }));
}

export async function getPod(ns: string, name: string): Promise<PodDetails> {
  const { data } = await api.get(`/pods/${ns}/${name}`);
  return {
    name,
    namespace: ns,
    status: data?.status ?? data?.phase ?? "Unknown",
    nodeName: data?.nodeName ?? data?.spec?.nodeName,
    age: data?.age, // якщо немає — додамо пізніше
    restarts: data?.restarts ?? data?.restartCount,
    labels: data?.labels ?? data?.metadata?.labels ?? {},
    containers: data?.containers ?? data?.containerInfo ?? [],
  };
}

export async function getPodLogs(
  ns: string,
  name: string,
  tailLines: number
): Promise<string> {
  const { data } = await api.get(`/pods/${ns}/${name}/logs`, {
    params: { tailLines },
  });
  // бекенд може повертати string або {logs:"..."}
  return typeof data === "string" ? data : (data?.logs ?? "");
}
