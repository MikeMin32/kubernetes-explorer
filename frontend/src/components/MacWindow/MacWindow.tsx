import "./MacWindow.css";
import k8sLogo from "../DetailsPanel/Kubernetes_logo_without_workmark.svg.png";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function MacWindow({ title, children }: Props) {
  return (
    <div className="mw-shell">
      <div className="mw-window">
        <div className="mw-titlebar">
          <div className="mw-left">
            <div className="mw-logo">
              <img src={k8sLogo} alt="Kubernetes" className="mw-logo-img" />
            </div>
            <div className="mw-title">{title}</div>
          </div>
          <div className="mw-right">
            <span className="mw-ghost-dot" />
            <span className="mw-ghost-dot" />
            <span className="mw-ghost-dot" />
          </div>
        </div>

        <div className="mw-content">{children}</div>
      </div>
    </div>
  );
}
