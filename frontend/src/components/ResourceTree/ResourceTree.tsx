import "./ResourceTree.css";
import type { NamespaceItem, NodeItem, PodListItem } from "../../api/types";

type Selected =
  | { kind: "node"; name: string }
  | { kind: "namespace"; name: string }
  | { kind: "pod"; namespace: string; name: string }
  | null;

type Props = {
  nodes: NodeItem[];
  namespaces: NamespaceItem[];
  podsByNs: Record<string, PodListItem[]>;
  podsLoadingNs: Record<string, boolean>;
  selected: Selected;

  onSelectNode: (name: string) => void;
  onSelectNamespace: (name: string) => void;
  onSelectPod: (ns: string, name: string) => void;
};

export function ResourceTree({
  nodes,
  namespaces,
  podsByNs,
  podsLoadingNs,
  selected,
  onSelectNode,
  onSelectNamespace,
  onSelectPod,
}: Props) {
  return (
    <div className="rt">
      <Section title="Nodes" defaultOpen={false}>
        {nodes.map((n) => (
          <Row
            key={n.name}
            icon="node"
            text={n.name}
            active={selected?.kind === "node" && selected.name === n.name}
            onClick={() => onSelectNode(n.name)}
          />
        ))}
      </Section>

      <Divider />

      <Section title="Namespaces" defaultOpen={false}>
        {namespaces.map((ns) => (
          <Row
            key={ns.name}
            icon="ns"
            text={ns.name}
            active={selected?.kind === "namespace" && selected.name === ns.name}
            onClick={() => onSelectNamespace(ns.name)}
          />
        ))}
      </Section>

      <Divider />

      <Section title="Pods" defaultOpen={false}>
        {selected?.kind === "namespace" || selected?.kind === "pod" ? (
          <>
            {(() => {
              const nsName = selected.kind === "namespace" ? selected.name : selected.namespace;
              return (
                <>
                  {podsLoadingNs[nsName] ? <div className="rt-muted">Loading…</div> : null}

                  {(podsByNs[nsName] ?? []).map((p) => (
                    <Row
                      key={`${p.namespace}/${p.name}`}
                      icon="pod"
                      text={p.name}
                      active={
                        selected?.kind === "pod" && selected.namespace === p.namespace && selected.name === p.name
                      }
                      onClick={() => onSelectPod(p.namespace, p.name)}
                    />
                  ))}

                  {!podsLoadingNs[nsName] && (podsByNs[nsName] ?? []).length === 0 ? (
                    <div className="rt-muted">No pods</div>
                  ) : null}
                </>
              );
            })()}
          </>
        ) : (
          <div className="rt-muted">Select a namespace to view pods</div>
        )}
      </Section>
    </div>
  );
}

function Divider() {
  return <div className="rt-divider" />;
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="rt-section" open={defaultOpen}>
      <summary className="rt-summary">
        <span className="rt-caret" aria-hidden />
        <span className="rt-title">{title}</span>
      </summary>
      <div className="rt-rows">{children}</div>
    </details>
  );
}

function Row({
  icon,
  text,
  active,
  onClick,
}: {
  icon: "node" | "ns" | "pod";
  text: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`rt-row ${active ? "active" : ""}`} onClick={onClick} type="button">
      <span className={`rt-ico ${icon}`} aria-hidden />
      <span className="rt-text">{text}</span>
    </button>
  );
}
