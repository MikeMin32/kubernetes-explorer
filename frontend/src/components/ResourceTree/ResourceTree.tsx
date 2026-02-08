import "./ResourceTree.css";
import type { NamespaceItem, NodeItem, PodListItem } from "../../api/types";

type SelectedPod = { namespace: string; name: string } | null;

type Props = {
  nodes: NodeItem[];
  namespaces: NamespaceItem[];
  podsByNs: Record<string, PodListItem[]>;
  selectedPod: SelectedPod;
  onSelectPod: (ns: string, name: string) => void;
};

export function ResourceTree({
  nodes,
  namespaces,
  podsByNs,
  selectedPod,
  onSelectPod,
}: Props) {
  return (
    <div className="rt">
      <Section title="Nodes" defaultOpen>
        {nodes.map((n) => (
          <Row key={n.name} icon="node" text={n.name} />
        ))}
      </Section>

      <Divider />

      <Section title="Namespaces" defaultOpen>
        {namespaces.map((ns) => (
          <Row key={ns.name} icon="ns" text={ns.name} />
        ))}
      </Section>

      <Divider />

      <Section title="Pods" defaultOpen>
        {/* MVP: показуємо pods лише demo (як на картинці) */}
        {(podsByNs["demo"] ?? []).map((p) => {
          const active = selectedPod?.namespace === p.namespace && selectedPod?.name === p.name;
          return (
            <Row
              key={`${p.namespace}/${p.name}`}
              icon="pod"
              text={p.name}
              active={active}
              onClick={() => onSelectPod(p.namespace, p.name)}
            />
          );
        })}
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
