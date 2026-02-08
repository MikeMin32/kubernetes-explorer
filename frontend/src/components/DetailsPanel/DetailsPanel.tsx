import "./DetailsPanel.css";
import type { NodeItem, NamespaceItem, PodDetails } from "../../api/types";
import k8sLogo from "./Kubernetes_logo_without_workmark.svg.png";

type Selected =
  | { kind: "node"; name: string }
  | { kind: "namespace"; name: string }
  | { kind: "pod"; namespace: string; name: string }
  | null;

function formatAge(ageSeconds?: number | null): string {
  if (!ageSeconds && ageSeconds !== 0) return "—";
  const s = Math.max(0, Math.floor(ageSeconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DetailsPanel({
  selected,
  node,
  namespace,
  pod,
  loading,
  onFetchLogs,
  fetchingLogs,
  hasLogs,
}: {
  selected: Selected;
  node: NodeItem | null;
  namespace: NamespaceItem | null;
  pod: PodDetails | null;
  loading?: boolean;
  onFetchLogs?: () => void;
  fetchingLogs?: boolean;
  hasLogs?: boolean;
}) {
  return (
    <div className="dp">
      {selected && (
        <div className="dp-header">
          <div className="dp-title">
            <span className="dp-h">Details:</span>{" "}
            <span className="dp-name">
              {selected?.kind === "pod"
                ? pod?.name ?? selected.name
                : selected?.kind === "node"
                ? node?.name ?? selected.name
                : selected?.kind === "namespace"
                ? namespace?.name ?? selected.name
                : "—"}
            </span>
          </div>
          {selected?.kind === "pod" && pod && onFetchLogs && !hasLogs && (
            <button 
              className="dp-fetch-btn" 
              onClick={onFetchLogs}
              disabled={fetchingLogs}
            >
              {fetchingLogs ? "Fetching…" : "Fetch Logs"}
            </button>
          )}
        </div>
      )}

      <div className="dp-body">
        {!selected ? (
          <div className="dp-welcome">
            <div className="dp-welcome-logo">
              <img src={k8sLogo} alt="Kubernetes" className="dp-welcome-img" />
            </div>
            <div className="dp-welcome-title">Kubernetes Explorer</div>
            <div className="dp-welcome-text">
              Select a resource from the sidebar
            </div>
            <div className="dp-welcome-links">
              <a href="https://www.linkedin.com/in/mykhailo-miniailo/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <span className="dp-welcome-separator">•</span>
              <a href="https://github.com/MikeMin32" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <span className="dp-welcome-separator">•</span>
              <a href="https://github.com/MikeMin32/kubernetes-explorer" target="_blank" rel="noopener noreferrer">
                Repository
              </a>
            </div>
            <div className="dp-welcome-author">
              by mikemin
            </div>
          </div>
        ) : selected.kind === "node" ? (
          node ? (
            <>
              <InfoRow label="Type" value="Node" />
              <InfoRow label="Status" value={<Badge text={node.status} />} />
              <InfoRow label="Roles" value={(node.roles?.length ? node.roles.join(", ") : "—")} />
              <InfoRow label="Kubelet" value={node.kubeletVersion ?? "—"} />
              <InfoRow label="Age" value={formatAge(node.ageSeconds)} />
              <div className="dp-sep" />
              <Labels labels={node.labels} />
            </>
          ) : (
            <div className="dp-muted">—</div>
          )
        ) : selected.kind === "namespace" ? (
          namespace ? (
            <>
              <InfoRow label="Type" value="Namespace" />
              <InfoRow label="Status" value={<Badge text={namespace.status} />} />
              <InfoRow label="Age" value={formatAge(namespace.ageSeconds)} />
              <div className="dp-sep" />
              <Labels labels={namespace.labels} />
            </>
          ) : (
            <div className="dp-muted">—</div>
          )
        ) : (
          // pod
          <>
            {loading ? <div className="dp-muted">Loading pod details…</div> : null}
            {!loading && !pod ? <div className="dp-muted">—</div> : null}
            {!loading && pod ? (
              <>
                <InfoRow label="Type" value="Pod" />
                <InfoRow label="Status" value={<Badge text={pod.status} />} />
                <InfoRow label="Restarts" value={String(pod.restarts ?? 0)} />
                <InfoRow label="Node" value={pod.nodeName ?? "—"} />
                <InfoRow label="Age" value={formatAge(pod.ageSeconds)} />
                <InfoRow label="Pod IP" value={pod.podIP ?? "—"} />
                <InfoRow label="Host IP" value={pod.hostIP ?? "—"} />

                <div className="dp-sep" />
                <Labels labels={pod.labels} />

                <div className="dp-sep" />
                <div className="dp-subtitle">Container Info:</div>
                <ul className="dp-list">
                  {pod.containers.map((c) => {
                    const cs = pod.containerStatuses.find((x) => x.name === c.name);
                    return (
                      <li key={c.name}>
                        <span className="dp-bullet">-</span>
                        <span className="dp-li">
                          Name: <b>{c.name}</b>
                        </span>
                        <span className="dp-li">
                          {" "}
                          | Image: <span className="dp-mono">{c.image ?? cs?.image ?? "—"}</span>
                        </span>
                        <span className="dp-li"> | Ready: <b>{String(cs?.ready ?? false)}</b></span>
                        <span className="dp-li"> | Restarts: <b>{String(cs?.restartCount ?? 0)}</b></span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function Labels({ labels }: { labels: Record<string, string> }) {
  const entries = Object.entries(labels ?? {});
  return (
    <>
      <div className="dp-subtitle">Labels:</div>
      <div className="dp-labels">
        {entries.length ? (
          entries.map(([k, v]) => (
            <span className="dp-chip" key={k}>
              <span className="dp-chip-k">{k}:</span> {v}
            </span>
          ))
        ) : (
          <span className="dp-muted">—</span>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dp-row">
      <div className="dp-label">{label}:</div>
      <div className="dp-value">{value}</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const t = (text || "").toLowerCase();
  const ok = t === "running" || t === "ready" || t === "active";
  return <span className={`dp-badge ${ok ? "ok" : ""}`}>{text || "Unknown"}</span>;
}
