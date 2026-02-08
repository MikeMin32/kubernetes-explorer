import "./LogsPanel.css";

type Props = {
  enabled: boolean;
  logs: string;
  tailLines: number;
  onTailLinesChange: (n: number) => void;
  loading?: boolean;
  onFetch: () => void;
  onClose?: () => void;
};

export function LogsPanel({ enabled, logs, tailLines, onTailLinesChange, loading, onFetch, onClose }: Props) {
  return (
    <div className="lp">
      <div className="lp-header">
        <div className="lp-title">Recent Logs:</div>

        <div className="lp-controls">
          <input
            className="lp-input"
            type="number"
            min={1}
            max={500}
            value={tailLines}
            onChange={(e) => onTailLinesChange(Number(e.target.value))}
            disabled={!enabled}
          />
          <button className="lp-btn" type="button" onClick={onFetch} disabled={!enabled || loading}>
            {loading ? "Fetching…" : "Fetch Logs"}
          </button>
          {onClose && (
            <button className="lp-close" type="button" onClick={onClose} title="Close logs">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="lp-box">
        <pre className="lp-pre">
          {!enabled ? "Select a pod to view logs." : logs ? logs : "—"}
        </pre>
      </div>
    </div>
  );
}
