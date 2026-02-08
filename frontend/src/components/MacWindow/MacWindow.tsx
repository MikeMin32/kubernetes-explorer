import "./MacWindow.css";

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
            <div className="mw-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="mw-appicon" aria-hidden />
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
