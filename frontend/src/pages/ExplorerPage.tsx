import { useEffect, useMemo, useState } from "react";
import { MacWindow } from "../components/MacWindow/MacWindow";
import { ResourceTree } from "../components/ResourceTree/ResourceTree";
import { DetailsPanel } from "../components/DetailsPanel/DetailsPanel";
import { LogsPanel } from "../components/LogsPanel/LogsPanel";
import { getNamespaces, getNodes, getPods, getPod, getPodLogs } from "../api/k8s";
import type { NamespaceItem, NodeItem, PodDetails, PodListItem } from "../api/types";
import "./ExplorerPage.css";

type Selected =
  | { kind: "node"; name: string }
  | { kind: "namespace"; name: string }
  | { kind: "pod"; namespace: string; name: string }
  | null;

export function ExplorerPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [podsByNs, setPodsByNs] = useState<Record<string, PodListItem[]>>({});
  const [podsLoadingNs, setPodsLoadingNs] = useState<Record<string, boolean>>({});

  const [selected, setSelected] = useState<Selected>(null);

  const [podDetails, setPodDetails] = useState<PodDetails | null>(null);
  const [logs, setLogs] = useState<string>("");

  const [tailLines, setTailLines] = useState<number>(10);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    (async () => {
      const [n, ns] = await Promise.all([getNodes(), getNamespaces()]);
      setNodes(n);
      setNamespaces(ns);

      // MVP: preload demo pods, але не хардкодимо дерево — просто підвантажимо дефолтний namespace якщо є
      if (ns.some((x) => x.name === "demo")) {
        await loadPodsForNamespace("demo");
      }
    })().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPodsForNamespace(ns: string) {
    if (podsByNs[ns]) return; // кеш
    setPodsLoadingNs((p) => ({ ...p, [ns]: true }));
    try {
      const pods = await getPods(ns);
      setPodsByNs((p) => ({ ...p, [ns]: pods }));
    } finally {
      setPodsLoadingNs((p) => ({ ...p, [ns]: false }));
    }
  }

  // when selecting pod -> fetch details
  useEffect(() => {
    setPodDetails(null);
    setLogs("");

    if (!selected) return;

    if (selected.kind === "pod") {
      setLoadingDetails(true);
      getPod(selected.namespace, selected.name)
        .then(setPodDetails)
        .finally(() => setLoadingDetails(false));
    }
  }, [selected]);

  const title = useMemo(() => "Kubernetes Explorer", []);

  const selectedNode = selected?.kind === "node" ? nodes.find((n) => n.name === selected.name) ?? null : null;
  const selectedNs = selected?.kind === "namespace" ? namespaces.find((n) => n.name === selected.name) ?? null : null;

  return (
    <MacWindow title={title}>
      <div className="xp-layout">
        <div className="xp-sidebar">
          <ResourceTree
            nodes={nodes}
            namespaces={namespaces}
            podsByNs={podsByNs}
            podsLoadingNs={podsLoadingNs}
            selected={selected}
            onSelectNode={(name) => setSelected({ kind: "node", name })}
            onSelectNamespace={async (name) => {
              setSelected({ kind: "namespace", name });
              await loadPodsForNamespace(name);
            }}
            onSelectPod={(namespace, name) => setSelected({ kind: "pod", namespace, name })}
          />
        </div>

        <div className="xp-main">
          <div className="xp-top">
            <DetailsPanel
              selected={selected}
              node={selectedNode}
              namespace={selectedNs}
              pod={podDetails}
              loading={loadingDetails}
              hasLogs={!!logs}
              onFetchLogs={async () => {
                if (!selected || selected.kind !== "pod") return;
                setLoadingLogs(true);
                try {
                  const txt = await getPodLogs(selected.namespace, selected.name, tailLines);
                  setLogs(txt);
                } finally {
                  setLoadingLogs(false);
                }
              }}
              fetchingLogs={loadingLogs}
            />
          </div>

          {logs && (
            <div className="xp-bottom">
              <LogsPanel
                enabled={selected?.kind === "pod"}
                logs={logs}
                tailLines={tailLines}
                onTailLinesChange={setTailLines}
                loading={loadingLogs}
                onFetch={async () => {
                  if (!selected || selected.kind !== "pod") return;
                  setLoadingLogs(true);
                  try {
                    const txt = await getPodLogs(selected.namespace, selected.name, tailLines);
                    setLogs(txt);
                  } finally {
                    setLoadingLogs(false);
                  }
                }}
                onClose={() => setLogs("")}
              />
            </div>
          )}
        </div>
      </div>
    </MacWindow>
  );
}
