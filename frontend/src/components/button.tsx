import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({ children, onClick, variant = "primary" }: Props) {
  const isSecondary = variant === "secondary";

  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: isSecondary ? "transparent" : "#5B5BD6",
        color: isSecondary ? "#111" : "white",
        border: isSecondary ? "1px solid #999" : "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}