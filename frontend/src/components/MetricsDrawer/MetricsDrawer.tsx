import { useEffect, useState } from "react";
import "./MetricsDrawer.css";
import { getMonitoringOverview } from "../../api/monitoring";
import type { MonitoringOverview } from "../../api/monitoring";

/* ------------------------------------------------------------------ */
/* KubernetesTab — always active while explorer view is shown          */
/* ------------------------------------------------------------------ */

export function KubernetesTab({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`mdr-tab${active ? " mdr-tab--active" : ""}`}
      onClick={onClick}
      title="Kubernetes Explorer"
      aria-pressed={active}
      aria-label="Switch to Kubernetes Explorer"
    >
      <span className="mdr-tab-label">Kubernetes</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* MetricsTab — active while metrics view is shown                     */
/* ------------------------------------------------------------------ */

export function MetricsTab({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`mdr-tab${active ? " mdr-tab--active" : ""}`}
      onClick={onToggle}
      title={active ? "Close Prometheus Metrics" : "Prometheus Metrics"}
      aria-pressed={active}
      aria-label="Toggle Prometheus metrics"
    >
      <span className="mdr-tab-label">Prometheus</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* MetricsPanel — inline content shown inside xp-top                  */
/* ------------------------------------------------------------------ */

export function MetricsPanel() {
  const [data, setData] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const d = await getMonitoringOverview();
      setData(d);
    } catch {
      setError("Failed to load metrics. Prometheus may be unreachable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mdr-panel">
      <div className="mdr-panel-header">
        <span className="mdr-panel-title">Prometheus Metrics</span>
        <button
          className="mdr-refresh-btn"
          onClick={fetchData}
          disabled={loading}
          aria-label="Refresh metrics"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="mdr-panel-body">
        {loading && <div className="mdr-status">Loading…</div>}

        {error && !loading && (
          <div className="mdr-error">{error}</div>
        )}

        {data && !loading && (
          <div className="mdr-metrics">
            <MetricCard label="Nodes Total"    value={data.nodes_total}                                                    accent="default" />
            <MetricCard label="Nodes Ready"    value={data.nodes_ready}                                                    accent="green"   />
            <MetricCard label="Pods Running"   value={data.pods_running}                                                   accent="blue"    />
            <MetricCard label="Restarts (15m)" value={Math.round(data.restarts_15m)} accent={data.restarts_15m > 0 ? "orange" : "green"} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MetricCard                                                          */
/* ------------------------------------------------------------------ */

type Accent = "default" | "green" | "blue" | "orange";

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: Accent;
}) {
  return (
    <div className={`mdr-card mdr-card--${accent}`}>
      <div className="mdr-card-value">{value}</div>
      <div className="mdr-card-label">{label}</div>
    </div>
  );
}
