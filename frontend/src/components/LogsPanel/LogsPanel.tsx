import "./LogsPanel.css";

type Props = {
  logs: string;
  tailLines: number;
  onTailLinesChange: (n: number) => void;
  loading?: boolean;
  onFetch: () => void;
};

export function LogsPanel({ logs, tailLines, onTailLinesChange, loading, onFetch }: Props) {
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
          />
          <button className="lp-btn" type="button" onClick={onFetch} disabled={loading}>
            {loading ? "Fetching…" : "Fetch Logs"}
          </button>
        </div>
      </div>

      <div className="lp-box">
        <pre className="lp-pre">{logs ? logs : "—"}</pre>
      </div>
    </div>
  );
}
