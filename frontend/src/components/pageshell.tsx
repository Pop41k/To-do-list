import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function PageShell({ children }: Props) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {children}
    </div>
  );
}