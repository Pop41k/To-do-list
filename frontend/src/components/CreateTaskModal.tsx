import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  onChangeTitle: (value: string) => void;

  onSubmit: () => void;
  onClose: () => void;
};

export default function CreateTaskModal({
  isOpen,
  title,
  onChangeTitle,
  onSubmit,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return; // закрыть через esc

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cm-modalOverlay" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div
        className="cm-modal"
        onMouseDown={(e) => e.stopPropagation()} // чтобы клики внутри не закрывали
      >
        <div className="cm-modalTitle">Суть задачи:</div>

        <div className="cm-modalField">
          <input
            ref={inputRef}
            className="cm-modalInput"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="Напиши задачу..."
          />
        </div>

        <button className="cm-modalSubmit" type="button" onClick={onSubmit}>
          Создать задачу
        </button>
      </div>
    </div>
  );
}