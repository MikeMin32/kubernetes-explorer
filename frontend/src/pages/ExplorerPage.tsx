import { useEffect, useMemo, useState } from "react";
import { MacWindow } from "../components/MacWindow/MacWindow.tsx";
import { ResourceTree } from "../components/ResourceTree/ResourceTree.tsx";
import { DetailsPanel } from "../components/DetailsPanel/DetailsPanel.tsx";
import { LogsPanel } from "../components/LogsPanel/LogsPanel.tsx";
import { getNamespaces, getNodes, getPods, getPod, getPodLogs } from "../api/k8s.ts";
import type { NamespaceItem, NodeItem, PodDetails, PodListItem } from "../api/types.ts";
import "./ExplorerPage.css";

type SelectedPod = { namespace: string; name: string } | null;

export function ExplorerPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceItem[]>([]);
  const [pods, setPods] = useState<Record<string, PodListItem[]>>({});

  const [selected, setSelected] = useState<SelectedPod>(null);
  const [podDetails, setPodDetails] = useState<PodDetails | null>(null);

  const [tailLines, setTailLines] = useState<number>(10);
  const [logs, setLogs] = useState<string>("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    (async () => {
      const [n, ns] = await Promise.all([getNodes(), getNamespaces()]);
      setNodes(n);
      setNamespaces(ns);

      // MVP: підтягуємо pods тільки для demo (як у твоєму кейсі), щоб не гальмувало
      const demoPods = await getPods("demo");
      setPods((prev) => ({ ...prev, demo: demoPods }));
    })().catch(console.error);
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingDetails(true);
    setPodDetails(null);
    setLogs("");

    getPod(selected.namespace, selected.name)
      .then(setPodDetails)
      .finally(() => setLoadingDetails(false));
  }, [selected?.namespace, selected?.name]);

  const title = useMemo(() => "Kubernetes Explorer", []);

  return (
    <MacWindow title={title}>
      <div className="xp-layout">
        <div className="xp-sidebar">
          <ResourceTree
            nodes={nodes}
            namespaces={namespaces}
            podsByNs={pods}
            selectedPod={selected}
            onSelectPod={(ns: string, name: string) => setSelected({ namespace: ns, name })}
          />
        </div>

        <div className="xp-main">
          <div className="xp-top">
            <DetailsPanel pod={podDetails} loading={loadingDetails} />
          </div>

          <div className="xp-bottom">
            <LogsPanel
              logs={logs}
              tailLines={tailLines}
              onTailLinesChange={setTailLines}
              loading={loadingLogs}
              onFetch={async () => {
                if (!selected) return;
                setLoadingLogs(true);
                try {
                  const txt = await getPodLogs(selected.namespace, selected.name, tailLines);
                  setLogs(txt);
                } finally {
                  setLoadingLogs(false);
                }
              }}
            />
          </div>
        </div>
      </div>
    </MacWindow>
  );
}
