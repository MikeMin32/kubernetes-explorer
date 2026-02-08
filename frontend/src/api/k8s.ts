import { api } from "./client";
import type { NodeItem, NamespaceItem, PodListItem, PodDetails } from "./types";

type ListResponse<T> = { items: T[] };

function items<T>(data: any, ctx: string): T[] {
  if (data && Array.isArray(data.items)) return data.items;
  throw new Error(`${ctx}: expected { items: [] }`);
}

export async function getNodes(): Promise<NodeItem[]> {
  const { data } = await api.get<ListResponse<NodeItem>>("/nodes");
  return items<NodeItem>(data, "GET /nodes");
}

export async function getNamespaces(): Promise<NamespaceItem[]> {
  const { data } = await api.get<ListResponse<NamespaceItem>>("/namespaces");
  return items<NamespaceItem>(data, "GET /namespaces");
}

export async function getPods(namespace: string): Promise<PodListItem[]> {
  const { data } = await api.get<ListResponse<PodListItem>>("/pods", { params: { namespace } });
  return items<PodListItem>(data, `GET /pods?namespace=${namespace}`);
}

export async function getPod(ns: string, name: string): Promise<PodDetails> {
  const { data } = await api.get<PodDetails>(`/pods/${ns}/${name}`);
  return data;
}

export async function getPodLogs(ns: string, name: string, tailLines: number): Promise<string> {
  const { data } = await api.get(`/pods/${ns}/${name}/logs`, { params: { tailLines } });
  if (Array.isArray(data?.lines)) return data.lines.join("\n");
  return "";
}
