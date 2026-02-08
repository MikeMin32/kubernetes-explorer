import "./DetailsPanel.css";
import type { PodDetails } from "../../api/types";

export function DetailsPanel({ pod, loading }: { pod: PodDetails | null; loading?: boolean }) {
  return (
    <div className="dp">
      <div className="dp-header">
        <div className="dp-title">
          <span className="dp-h">Pod Details:</span>{" "}
          <span className="dp-name">{pod?.name ?? "—"}</span>
        </div>
      </div>

      <div className="dp-body">
        {loading ? (
          <div className="dp-muted">Loading pod details…</div>
        ) : !pod ? (
          <div className="dp-muted">Select a pod in the left panel.</div>
        ) : (
          <>
            <InfoRow label="Status" value={<Badge text={pod.status ?? "Unknown"} />} />
            <InfoRow label="Restarts" value={String(pod.restarts ?? 0)} />
            <InfoRow label="Node" value={pod.nodeName ?? "—"} />
            <InfoRow label="Age" value={pod.age ?? "—"} />

            <div className="dp-sep" />

            <div className="dp-subtitle">Labels:</div>
            <div className="dp-labels">
              {pod.labels && Object.keys(pod.labels).length > 0 ? (
                Object.entries(pod.labels).map(([k, v]) => (
                  <span className="dp-chip" key={k}>
                    <span className="dp-chip-k">{k}:</span> {v}
                  </span>
                ))
              ) : (
                <span className="dp-muted">—</span>
              )}
            </div>

            <div className="dp-sep" />

            <div className="dp-subtitle">Container Info:</div>
            <div className="dp-container">
              {(pod.containers ?? []).length === 0 ? (
                <div className="dp-muted">—</div>
              ) : (
                <ul className="dp-list">
                  {pod.containers!.map((c) => (
                    <li key={c.name}>
                      <span className="dp-bullet">-</span>
                      <span className="dp-li">
                        Name: <b>{c.name}</b>
                      </span>
                      {c.image ? (
                        <span className="dp-li">
                          {" "}
                          | Image: <span className="dp-mono">{c.image}</span>
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
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
  const ok = text.toLowerCase() === "running";
  return <span className={`dp-badge ${ok ? "ok" : ""}`}>{text}</span>;
}
